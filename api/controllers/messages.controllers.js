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

    // emitSocketEvent(
    //   req,
    //   conversation._id,
    //   ConversationEventEnum.MESSAGE_RECEIVED,
    //   message.content
    // );

    res.status(201).send(message);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error creating server message" });
  }
};

export { sendDirectMessage, sendServerMessage };
