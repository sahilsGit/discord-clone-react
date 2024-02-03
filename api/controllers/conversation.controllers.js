import Channel from "../modals/channel.modals.js";
import DirectConversation from "../modals/directConversation.modals.js";
import Profile from "../modals/profile.modals.js";

export const getOrCreateConversation = async (req, res, next) => {
  try {
    const profileOneId = req.params.profileOneId;
    const profileTwoId = req.params.profileTwoId;

    if (profileOneId === profileTwoId) {
      return res
        .status(201)
        .send("You can't initiate a conversation with yourself");
    }

    const theirProfile = await Profile.findById(profileTwoId).select(
      "_id name image username"
    );

    // Use findOneAndUpdate to create or find the conversation
    const conversation = await DirectConversation.findOneAndUpdate(
      {
        $or: [
          { initiatedBy: profileOneId, initiatedFor: profileTwoId },
          { initiatedBy: profileTwoId, initiatedFor: profileOneId },
        ],
      },
      {
        $setOnInsert: {
          initiatedBy: profileOneId,
          initiatedFor: profileTwoId,
          messages: [], // You can add other necessary fields here
        },
      },
      {
        new: true, // Return the updated document if found or created
        upsert: true, // Create the document if it doesn't exist
      }
    );

    if (res.body) {
      res.body = {
        ...res.body,
        memberProfile: theirProfile,
        conversation: conversation,
      };
    } else {
      res.body = {
        memberProfile: theirProfile,
        conversation: conversation,
      };
    }

    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};

export const getAllConversations = async (req, res, next) => {
  try {
    const profileId = req.params.profileId;

    const conversations = await DirectConversation.find({
      $or: [{ initiatedBy: profileId }, { initiatedFor: profileId }],
    })
      .populate([
        {
          path: "initiatedBy",
          match: { _id: { $ne: req.user.profileId } },
          select: "name _id image",
        },
        {
          path: "initiatedFor",
          match: { _id: { $ne: req.user.profileId } },
          select: "name _id image",
        },
      ])
      .select(["_id", "initiatedBy", "initiatedFor"]);

    if (res.body) {
      res.body = {
        ...res.body,
        conversations: conversations,
      };
    } else {
      res.body = { conversations: conversations };
    }
    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};

export const getServerConversation = async (req, res, next) => {
  const channelId = req.params.channelId;
  const memberId = req.params.memberId;

  try {
    const conversationDocument = await Channel.findOne({
      _id: channelId,
      members: { $elemMatch: { $eq: memberId } },
    })
      .select("conversationId")
      .populate("conversationId");

    if (!conversationDocument) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (res.body) {
      res.body = {
        ...res.body,
        conversation: conversationDocument,
      };
    } else {
      res.body = { conversation: conversationDocument };
    }
    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};
