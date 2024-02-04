import mongoose from "mongoose";
import DirectMessage from "../modals/directMessage.modals.js";
import Member from "../modals/member.modals.js";
import ServerConversation from "../modals/serverConversation.modals.js";
import ServerMessage from "../modals/serverMessage.modals.js";
import { emitSocketEvent } from "../socket/io.js";
import { ConversationEventEnum } from "../utils/constants.js";
import { getLocalPath, getStaticFilePath } from "../utils/helpers.js";
import DirectConversation from "../modals/directConversation.modals.js";

// Common serverMessages pipeline
const commonMessagesPipeline = [
  {
    $lookup: {
      from: "members",
      localField: "memberId",
      foreignField: "_id",
      as: "member",
    },
  },
  {
    $unwind: "$member",
  },
  {
    $lookup: {
      from: "profiles",
      localField: "member.profileId",
      foreignField: "_id",
      as: "member.profile",
    },
  },
  {
    $unwind: "$member.profile",
  },
  {
    $project: {
      _id: 1,
      content: 1,
      fileUrl: 1,
      memberId: 1,
      channelId: 1,
      serverId: 1,
      conversationId: 1,
      deleted: 1,
      createdAt: 1,
      updatedAt: 1,
      "member.role": 1,
      "member.profile.name": 1,
      "member.profile.image": 1,
      "member._id": 1,
    },
  },
];

// Common directMessages pipeline
const directMessagePipeline = [
  {
    $lookup: {
      from: "profiles",
      localField: "senderId",
      foreignField: "_id",
      as: "sender",
    },
  },
  { $unwind: "$sender" },
  {
    $project: {
      _id: 1,
      content: 1,
      fileUrl: 1,
      senderId: 1,
      receiverId: 1,
      conversationId: 1,
      deleted: 1,
      createdAt: 1,
      updatedAt: 1,
      "sender._id": 1,
      "sender.name": 1,
      "sender.image": 1,
    },
  },
];

const sendDirectMessage = async (req, res, next) => {
  /*
   *
   * Handles direct message sending logic
   *
   */
  try {
    // Get details of both the participants
    const { myProfileId, memberProfileId } = req.query;

    // Get content
    const { content } = req.body;
    const messageFiles = [];

    // To store attachments and associate those with their names
    if (req.files && req.files.attachments?.length > 0) {
      req.files.attachments?.map((attachment) => {
        messageFiles.push({
          url: getStaticFilePath(req, attachment.filename),
          localPath: getLocalPath(attachment.filename),
        });
      });
    }

    // Validate required fields
    if (!memberProfileId || !myProfileId) {
      return res.status(400).send({
        message: "At least two participants are required!",
      });
    }

    // Find the conversation
    const conversation = await DirectConversation.findOne({
      $or: [
        { initiatedBy: memberProfileId, initiatedFor: myProfileId },
        { initiatedBy: myProfileId, initiatedFor: memberProfileId },
      ], // Conversation could have been initiated by any of the party
    });

    // Create the server message
    const message = new DirectMessage({
      content,
      senderId: myProfileId,
      receiverId: memberProfileId,
      conversationId: conversation._id,
    });

    // Save the message
    await message.save();

    // Add message to conversation
    conversation.messages.push(message);
    await conversation.save();

    // Create the newly sent message's info payload for client
    const messageDocument = await DirectMessage.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(message._id) } },
      ...directMessagePipeline,
    ]);

    // Emit the socket event with message details

    // To sender
    emitSocketEvent(
      req,
      message.senderId.toHexString(),
      ConversationEventEnum.MESSAGE_RECEIVED,
      messageDocument[0]
    );

    // To receiver
    emitSocketEvent(
      req,
      message.receiverId.toHexString(),
      ConversationEventEnum.MESSAGE_RECEIVED,
      messageDocument[0]
    );

    res.status(201).send({ message: "Message sent successfully" });
  } catch (error) {
    // Handle any left over error
    next(error);
  }
};

const sendServerMessage = async (req, res, next) => {
  /*
   *
   * Handles server message sending logic
   *
   */
  try {
    // Get details of channel and member who is sending the message
    const { channelId, memberId } = req.query;

    // Get content
    const { content } = req.body;
    const messageFiles = [];

    // To store attachments and associate those with their names
    if (req.files && req.files.attachments?.length > 0) {
      req.files.attachments?.map((attachment) => {
        messageFiles.push({
          url: getStaticFilePath(req, attachment.filename),
          localPath: getLocalPath(attachment.filename),
        });
      });
    }

    // Validate required fields
    if (!channelId || !memberId) {
      return res
        .status(400)
        .send({ error: "channelId and serverId are required" });
    }

    // Find the conversation for this channel
    const conversation = await ServerConversation.findOne({
      channelId,
    });

    // Create the server message
    const message = new ServerMessage({
      content,
      channelId,
      serverId: conversation.serverId,
      conversationId: conversation._id,
      memberId: memberId,
    });

    // Save the message
    await message.save();

    // Add the messageId to the messages list of all the messages sent by this member
    await Member.updateOne(
      {
        _id: memberId,
      },
      {
        $push: { messages: message._id },
      }
    );

    // Add message to conversation
    conversation.messages.push(message);
    await conversation.save();

    // Create the newly sent message's info payload for client
    const messageDocument = await ServerMessage.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(message._id) } },
      ...commonMessagesPipeline,
    ]);

    // Emit the socket event with message details
    emitSocketEvent(
      req,
      channelId,
      ConversationEventEnum.MESSAGE_RECEIVED,
      messageDocument[0]
    );

    res.status(201).send({ message: "Message sent successfully" });
  } catch (error) {
    // Handle any left over error
    next(error);
  }
};

const fetchMessages = async (req, res, next) => {
  /*
   *
   * Fetch messages wrapper for infinite scroll
   *
   */
  const channelId = req.query.channelId || req.params.channelId;

  // Conditionally choose the appropriate handler based on query params
  try {
    channelId
      ? await fetchServerMessages(req, res) // Call the server messages handler
      : await fetchDirectMessages(req, res); // Call the direct messages handler
  } catch (error) {
    // Handle any left over error
    next(error);
  }
};

const fetchServerMessages = async (req, res, next) => {
  /*
   *
   * Fetches messages for infinite scroll
   *
   */

  // Set limit and get latest cursor
  const limit = 10;
  const { cursor, channelId } = req.query;

  // Validate
  try {
    if (!channelId) {
      res
        .status(404)
        .send({ message: "Can't find conversation without channelId" });
    }

    // Extend pipeline
    const queryPipeline = [
      { $match: { channelId: new mongoose.Types.ObjectId(channelId) } },
      ...commonMessagesPipeline,
    ];

    // If the request has cursor then add logic to process cursor so that it fetches messages older then cursor date
    if (cursor && cursor !== "null" && cursor !== "undefined")
      queryPipeline.push({ $match: { createdAt: { $lt: new Date(cursor) } } });
    queryPipeline.push({ $sort: { createdAt: -1 } }, { $limit: limit + 1 });

    // Get the messages
    let messages = await ServerMessage.aggregate(queryPipeline);

    // Check if there are more messages to fetch for next batch by fetching one extra message and popping it
    const hasMoreDocuments = messages.length > limit;
    if (hasMoreDocuments) {
      messages.pop();
    }

    // New cursor is timestamp of the last message returned
    let newCursor;

    // TODO: Explain what's going on here! //
    if (channelId) newCursor = messages[messages.length - 1]?.createdAt;
    else newCursor = messages?.createdAt;

    // Response is customized to fulfill token-related demand,
    // Refer to auth.middlewares.js (71-82) for more information.

    if (res.body) {
      res.body = {
        ...res.body,
        messages,
        newCursor,
        hasMoreMessages: hasMoreDocuments,
      };
    } else {
      res.body = {
        messages,
        newCursor,
        hasMoreMessages: hasMoreDocuments,
      };
    }

    // Send response
    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};

const fetchDirectMessages = async (req, res, next) => {
  const limit = 10;
  const { cursor, conversationId, myProfileId, memberProfileId } = req.query;

  try {
    if (!conversationId) {
      if (!myProfileId && !memberProfileId) {
        res
          .status(404)
          .send(
            "Either ConversationId or profileId of both the persons are needed to find the conversation"
          );
      }
    }

    let queryPipeline;

    if (conversationId) {
      queryPipeline = [
        {
          $match: {
            conversationId: new mongoose.Types.ObjectId(conversationId),
          },
        },
        ...directMessagePipeline,
      ];
    } else {
      queryPipeline = [
        {
          $match: {
            $or: [
              {
                senderId: new mongoose.Types.ObjectId(memberProfileId),
                receiverId: new mongoose.Types.ObjectId(myProfileId),
              },
              {
                senderId: new mongoose.Types.ObjectId(myProfileId),
                receiverId: new mongoose.Types.ObjectId(memberProfileId),
              },
            ],
          },
        },
        ...directMessagePipeline,
      ];
    }

    if (cursor && cursor !== "null" && cursor !== "undefined")
      queryPipeline.push({ $match: { createdAt: { $lt: new Date(cursor) } } });
    queryPipeline.push({ $sort: { createdAt: -1 } }, { $limit: limit + 1 });

    const messages = await DirectMessage.aggregate(queryPipeline);

    const hasMoreDocuments = messages.length > limit;
    if (hasMoreDocuments) {
      // Remove the extra document fetched for checking
      messages.pop();
    }

    // New cursor is timestamp of the last message returned
    const newCursor = messages[messages.length - 1]?.createdAt;

    if (res.body) {
      res.body = {
        ...res.body,
        messages: messages,
        newCursor,
        hasMoreMessages: hasMoreDocuments,
      };
    } else {
      res.body = {
        messages: messages,
        newCursor,
        hasMoreMessages: hasMoreDocuments,
      };
    }

    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};

const updateMessage = async (req, res, next) => {
  try {
    const { messageId, memberId } = req.params;
    const { content } = req.body;

    // Find and update the message in the database
    const updatedMessage = await ServerMessage.findOneAndUpdate(
      { _id: messageId, memberId: memberId },
      { $set: { content: content } }
    );

    const messageDocument = await ServerMessage.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(messageId) } },
      ...commonMessagesPipeline,
    ]);

    // Check if the message was found and updated
    if (updatedMessage) {
      const channelId = updatedMessage.channelId.toHexString();

      emitSocketEvent(
        req,
        channelId,
        ConversationEventEnum.MESSAGE_EDITED,
        messageDocument[0]
      );

      res.status(200).send(res.body);
    } else {
      res
        .status(404)
        .json({ success: false, message: "Message not found for update" });
    }
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { messageId, memberId } = req.params;
    const content = "This message has been deleted!";

    // Find and update the message in the database
    const updatedMessage = await ServerMessage.findOneAndUpdate(
      { _id: messageId, memberId: memberId },
      { $set: { content: content, deleted: true } }
    );

    const messageDocument = await ServerMessage.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(messageId) } },
      ...commonMessagesPipeline,
    ]);

    // Check if the message was found and updated
    if (updatedMessage) {
      const channelId = updatedMessage.channelId.toHexString();

      emitSocketEvent(
        req,
        channelId,
        ConversationEventEnum.MESSAGE_DELETED,
        messageDocument[0]
      );

      res.status(200).send(res.body);
    } else {
      res
        .status(404)
        .json({ success: false, message: "Message not found for update" });
    }
  } catch (error) {
    next(error);
  }
};

const updateDirectMessage = async (req, res, next) => {
  try {
    const { messageId, profileId } = req.params;
    const { content } = req.body;

    // Find and update the message in the database
    const updatedMessage = await DirectMessage.findOneAndUpdate(
      { _id: messageId, senderId: profileId },
      { $set: { content: content } }
    );

    const messageDocument = await DirectMessage.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(messageId) } },
      ...directMessagePipeline,
    ]);

    // Check if the message was found and updated
    if (updatedMessage) {
      const senderId = updatedMessage.senderId.toHexString();

      emitSocketEvent(
        req,
        senderId,
        ConversationEventEnum.MESSAGE_EDITED,
        messageDocument[0]
      );

      res.status(200).send(res.body);
    } else {
      res
        .status(404)
        .json({ success: false, message: "Message not found for update" });
    }
  } catch (error) {
    next(error);
  }
};

const deleteDirectMessage = async (req, res, next) => {
  try {
    const { messageId, profileId } = req.params;
    const content = "This message has been deleted!";

    // Find and update the message in the database
    const updatedMessage = await DirectMessage.findOneAndUpdate(
      { _id: messageId, senderId: profileId },
      { $set: { content: content, deleted: true } }
    );

    const messageDocument = await DirectMessage.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(messageId) } },
      ...directMessagePipeline,
    ]);

    // Check if the message was found and updated
    if (updatedMessage) {
      const senderId = updatedMessage.senderId.toHexString();

      emitSocketEvent(
        req,
        senderId,
        ConversationEventEnum.MESSAGE_DELETED,
        messageDocument[0]
      );

      res.status(200).send(res.body);
    } else {
      res
        .status(404)
        .json({ success: false, message: "Message not found for update" });
    }
  } catch (error) {
    next(error);
  }
};

export {
  sendDirectMessage,
  sendServerMessage,
  fetchMessages,
  updateDirectMessage,
  updateMessage,
  deleteMessage,
  deleteDirectMessage,
};
