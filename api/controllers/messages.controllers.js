import DirectMessage from "../modals/directMessage.modals.js";
import Member from "../modals/member.modals.js";
import ServerConversation from "../modals/serverConversation.modals.js";
import ServerMessage from "../modals/serverMessage.modals.js";
import { emitSocketEvent } from "../socket/io.js";
import { ConversationEventEnum } from "../utils/constants.js";
import { getLocalPath, getStaticFilePath } from "../utils/helpers.js";

const sendDirectMessage = async (req, res, next) => {
  res.status(201).send({ message: "it did hit" });
};

const sendServerMessage = async (req, res, next) => {
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

    console.log(channelId, memberId, content);

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

    emitSocketEvent(
      req,
      channelId,
      ConversationEventEnum.MESSAGE_RECEIVED,
      message
    );

    res.status(201).send(message);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error creating server message" });
  }
};

const fetchMessages = async (req, res) => {
  const limit = 10;

  try {
    const { cursor, channelId, memberId, conversationId } = req.query;

    console.log(cursor);

    let query;

    if (conversationId) {
      query = DirectMessage.find({ conversationId: conversationId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } else {
      query = ServerMessage.find({ channelId: channelId })
        .sort({ createdAt: -1 })
        .limit(limit);
    }

    if (cursor && cursor !== "null" && cursor !== "undefined") {
      query.where({ createdAt: { $lt: cursor } });
    }

    console.log(query);

    const messages = await query;
    console.log(messages);

    // New cursor is timestamp of last message returned
    if (res.body) {
      res.body = {
        ...res.body,
        messages,
        newCursor: messages[messages.length - 1]?.createdAt,
      };
    } else {
      res.body = {
        messages,
        newCursor: messages[messages.length - 1]?.createdAt,
      };
    }
    res.status(200).send(res.body);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export { sendDirectMessage, sendServerMessage, fetchMessages };
