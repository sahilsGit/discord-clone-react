import Channel from "../modals/channel.modals.js";
import DirectConversation from "../modals/directConversation.modals.js";
import Profile from "../modals/profile.modals.js";

const getOrCreateConversation = async (req, res, next) => {
  /*
   *
   * Gets the details of a specific conversation, or creates it if it doesn't exist
   *
   */
  try {
    // Profiles Ids are those of the participants of the conversation
    const profileOneId = req.params.profileOneId;
    const profileTwoId = req.params.profileTwoId;

    // Both parties can be the same
    if (profileOneId === profileTwoId) {
      return res
        .status(201)
        .send({ message: "You can't initiate a conversation with yourself" });
    }

    // Profile of the person with whom the current user is having a conversation with
    const theirProfile = await Profile.findById(profileTwoId).select(
      "_id name image username"
    );

    // Use findOneAndUpdate to create or find the conversation
    const conversation = await DirectConversation.findOneAndUpdate(
      {
        $or: [
          { initiatedBy: profileOneId, initiatedFor: profileTwoId },
          { initiatedBy: profileTwoId, initiatedFor: profileOneId },
        ], // "$or" is used because we don't know who is the initiator of the conversation
      },
      {
        $setOnInsert: {
          initiatedBy: profileOneId,
          initiatedFor: profileTwoId,
          messages: [],
        },
      },
      {
        new: true, // Return the updated document if found or created
        upsert: true, // Create the document if it doesn't exist
      }
    );

    await Profile.updateMany(
      {
        _id: { $in: [profileOneId, profileTwoId] },
      },
      {
        $addToSet: { directConversations: conversation._id },
      }
    );

    // Response is customized to fulfill token-related demand,
    // Refer to auth.middlewares.js (71-82) for more information.
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

    // Send response
    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};

const getAllConversations = async (req, res, next) => {
  /*
   *
   * Gets basic details of all the conversation the current user is part of
   *
   */
  try {
    const profileId = req.params.profileId;

    const conversations = await DirectConversation.find({
      $or: [{ initiatedBy: profileId }, { initiatedFor: profileId }],
    }) // "$or" is used because we don't know who is the initiator of the conversation
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
      ]) // Only other participant's profile details are needed not the current user's
      .select(["_id", "initiatedBy", "initiatedFor"]);

    // Response is customized to fulfill token-related demand,
    // Refer to auth.middlewares.js (71-82) for more information.

    if (res.body) {
      res.body = {
        ...res.body,
        conversations: conversations,
      };
    } else {
      res.body = { conversations: conversations };
    }

    // Send response
    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};

const getServerConversation = async (req, res, next) => {
  /*
   *
   * Gets the conversation pertaining to specific channel of a server
   *
   */
  const channelId = req.params.channelId;
  const memberId = req.params.memberId;

  try {
    // Check if the current user is a member of the channel
    const conversationDocument = await Channel.findOne({
      _id: channelId,
      members: { $elemMatch: { $eq: memberId } },
    })
      .select("conversationId")
      .populate("conversationId");

    // Either the channel doesn't exist of current member is not part of the channel
    if (!conversationDocument) {
      return res.status(404).send({ message: "Conversation not found" });
    }

    // Response is customized to fulfill token-related demand,
    // Refer to auth.middlewares.js (71-82) for more information.

    if (res.body) {
      res.body = {
        ...res.body,
        conversation: conversationDocument,
      };
    } else {
      res.body = { conversation: conversationDocument };
    }

    // Send response
    res.status(200).send(res.body);
  } catch (error) {
    // Catch general error
    next(error);
  }
};

export { getOrCreateConversation, getAllConversations, getServerConversation };
