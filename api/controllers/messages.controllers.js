import mongoose from "mongoose";
import DirectMessage from "../modals/directMessage.modals.js";
import Member from "../modals/member.modals.js";
import ServerConversation from "../modals/serverConversation.modals.js";
import ServerMessage from "../modals/serverMessage.modals.js";
import { emitSocketEvent } from "../socket/io.js";
import { ConversationEventEnum } from "../utils/constants.js";
import { getLocalPath, getStaticFilePath } from "../utils/helpers.js";
import DirectConversation from "../modals/directConversation.modals.js";

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
  try {
    const { myProfileId, memberProfileId } = req.query;
    const { content } = req.body;
    const messageFiles = [];

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
        error: "memberProfileId and your profileIds are required",
      });
    }

    // Find the conversation for this channel + server
    const conversation = await DirectConversation.findOne({
      $or: [
        { initiatedBy: memberProfileId, initiatedFor: myProfileId },
        { initiatedBy: myProfileId, initiatedFor: memberProfileId },
      ],
    });

    console.log("ppp", myProfileId);

    // Create the server message
    const message = new DirectMessage({
      content,
      senderId: myProfileId,
      receiverId: memberProfileId,
      conversationId: conversation._id,
    });

    await message.save();

    // Add message to conversation
    conversation.messages.push(message);
    await conversation.save();

    const messageDocument = await DirectMessage.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(message._id) } },
      ...directMessagePipeline,
    ]);

    emitSocketEvent(
      req,
      message.senderId.toHexString(),
      ConversationEventEnum.MESSAGE_RECEIVED,
      messageDocument[0]
    );

    emitSocketEvent(
      req,
      message.receiverId.toHexString(),
      ConversationEventEnum.MESSAGE_RECEIVED,
      messageDocument[0]
    );

    res.status(201).send(message);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
};

const sendServerMessage = async (req, res) => {
  try {
    const { channelId, memberId } = req.query;
    const { content } = req.body;

    const messageFiles = [];

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

    // Find the conversation for this channel + server
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

    await message.save();

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

    const messageDocument = await ServerMessage.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(message._id) } },
      ...commonMessagesPipeline,
    ]);

    emitSocketEvent(
      req,
      channelId,
      ConversationEventEnum.MESSAGE_RECEIVED,
      messageDocument[0]
    );

    res.status(201).send(message);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error creating server message" });
  }
};

const fetchMessages = async (req, res) => {
  const channelId = req.query.channelId || req.params.channelId;

  // Conditionally choose the appropriate handler based on query params
  if (channelId) {
    await fetchServerMessages(req, res); // Call the server messages handler
  } else {
    await fetchDirectMessages(req, res); // Call the direct messages handler
  }
};

const fetchServerMessages = async (req, res) => {
  const limit = 10;
  const { cursor, channelId } = req.query;

  try {
    if (!channelId) {
      res.status(404).send("Can't find conversation without channelId");
    }

    const queryPipeline = [
      { $match: { channelId: new mongoose.Types.ObjectId(channelId) } },
      ...commonMessagesPipeline,
    ];

    if (cursor && cursor !== "null" && cursor !== "undefined")
      queryPipeline.push({ $match: { createdAt: { $lt: new Date(cursor) } } });
    queryPipeline.push({ $sort: { createdAt: -1 } }, { $limit: limit + 1 });

    let messages = await ServerMessage.aggregate(queryPipeline);

    const hasMoreDocuments = messages.length > limit;
    if (hasMoreDocuments) {
      // Remove the extra document fetched for checking
      messages.pop();
    }

    // New cursor is timestamp of the last message returned
    let newCursor;

    if (channelId) newCursor = messages[messages.length - 1]?.createdAt;
    else newCursor = messages?.createdAt;

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

    res.status(200).send(res.body);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

const fetchDirectMessages = async (req, res) => {
  const limit = 10;
  const { cursor, conversationId, myProfileId, memberProfileId } = req.query;

  try {
    if (!conversationId) {
      if (!myProfileId && !memberProfileId) {
        res
          .status(404)
          .send(
            "Either ConversationId or profileId of both the persons are need to find the conversation"
          );
      }
    }

    let queryPipeline;

    if (conversationId) {
      console.log("cvddcdcd", conversationId);
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

    console.log(queryPipeline);

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
    console.log(error);
    res.status(500).send(error.message);
  }
};

const updateMessage = async (req, res) => {
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
    // Handle errors and respond with an error status
    console.error("Error updating message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateDirectMessage = async (req, res) => {
  console.log("here");
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

    console.log(messageDocument);

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
    // Handle errors and respond with an error status
    console.error("Error updating message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  sendDirectMessage,
  sendServerMessage,
  fetchMessages,
  updateDirectMessage,
  updateMessage,
};

// db.directmessages.aggregate([
//   {
//     $match: {
//       $or: [
//         {
//           senderId: ObjectId("6596af8a1ff3b6447eae0579"),
//           receiverId: ObjectId("6596afd01ff3b6447eae058a"),
//         },
//         {
//           receiverId: ObjectId("6596afd01ff3b6447eae058a"),
//           senderId: ObjectId("6596afd01ff3b6447eae058a"),
//         },
//       ],
//     },
//   },
//   {
//     $lookup: {
//       from: "profiles",
//       localField: "senderId",
//       foreignField: "_id",
//       as: "sender",
//     },
//   },
//   { $unwind: "$sender" },
//   {
//     $project: {
//       _id: 1,
//       content: 1,
//       fileUrl: 1,
//       senderId: 1,
//       receiverId: 1,
//       deleted: 1,
//       createdAt: 1,
//       updatedAt: 1,
//       "sender._id": 1,
//       "sender.name": 1,
//       "sender.image": 1,
//     },
//   },
//   { $sort: { createdAt: -1 } },
//   { $limit: 10 + 1 },
// ]);
