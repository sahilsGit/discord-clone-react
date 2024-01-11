import mongoose from "mongoose";
import DirectMessage from "../modals/directMessage.modals.js";
import Member from "../modals/member.modals.js";
import ServerConversation from "../modals/serverConversation.modals.js";
import ServerMessage from "../modals/serverMessage.modals.js";
import { emitSocketEvent } from "../socket/io.js";
import { ConversationEventEnum } from "../utils/constants.js";
import { getLocalPath, getStaticFilePath } from "../utils/helpers.js";

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
      "member.role": 1,
      "member.profile.name": 1,
      "member.profile.image": 1,
    },
  },
];

const sendDirectMessage = async (req, res, next) => {
  res.status(201).send({ message: "it did hit" });
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

// const fetchMessages = async (req, res) => {
//   const limit = 10;

//   try {
//     const { cursor, channelId, conversationId } = req.query;

//     console.log(cursor);

//     let query;

//     if (conversationId) {
//       query = DirectMessage.find({ conversationId: conversationId })
//         .sort({ createdAt: -1 })
//         .limit(limit + 1);
//     } else {
//       query = ServerMessage.find({ channelId: channelId })
//         .sort({ createdAt: -1 })
//         .limit(limit + 1);
//     }

//     if (cursor && cursor !== "null" && cursor !== "undefined") {
//       query.where({ createdAt: { $lt: cursor } });
//     }

//     console.log(query);

//     const messages = await query;

//     const hasMoreDocuments = messages.length > limit;
//     if (hasMoreDocuments) {
//       // Remove the extra document fetched for checking
//       messages.pop();
//     }

//     // New cursor is timestamp of last message returned
//     if (res.body) {
//       res.body = {
//         ...res.body,
//         messages,
//         newCursor: messages[messages.length - 1]?.createdAt,
//         hasMoreMessages: hasMoreDocuments,
//       };
//     } else {
//       res.body = {
//         messages,
//         newCursor: messages[messages.length - 1]?.createdAt,
//         hasMoreMessages: hasMoreDocuments,
//       };
//     }
//     res.status(200).send(res.body);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message);
//   }
// };

const fetchMessages = async (req, res) => {
  const limit = 10;
  const { cursor, channelId, conversationId } = req.query;

  try {
    let queryPipeline = [];

    if (conversationId)
      queryPipeline = [
        {
          $match: {
            conversationId: new mongoose.Types.ObjectId(conversationId),
          },
        },
      ];
    else
      queryPipeline = [
        { $match: { channelId: new mongoose.Types.ObjectId(channelId) } },
      ];

    queryPipeline = [...queryPipeline, ...commonMessagesPipeline];

    if (cursor && cursor !== "null" && cursor !== "undefined")
      queryPipeline.push({ $match: { createdAt: { $lt: new Date(cursor) } } });
    queryPipeline.push({ $sort: { createdAt: -1 } }, { $limit: limit + 1 });

    const messages = await ServerMessage.aggregate(queryPipeline);

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

export { sendDirectMessage, sendServerMessage, fetchMessages };
