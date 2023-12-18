import { DirectConversation, Profile } from "../modals/Schema.js";

export const findConversation = async (req, res) => {
  try {
    // const { profileOneId, profileTwoId } = req.params;
    const profileOneId = req.params.profileOneId;
    const profileTwoId = req.params.profileTwoId;

    if (profileOneId === profileTwoId) {
      return res
        .status(201)
        .send("You can't initiate conversation with yourself");
    }
    let conversation;

    // Check if a conversation already exists
    conversation = await DirectConversation.findOne({
      $or: [
        { initiatedBy: profileOneId, initiatedFor: profileTwoId },
        { initiatedBy: profileTwoId, initiatedFor: profileOneId },
      ],
    });

    if (!conversation) {
      // Conversation does not exist, create a new one
      conversation = new DirectConversation({
        initiatedBy: profileOneId,
        initiatedFor: profileTwoId,
        messages: [], // You can add other necessary fields here
      });

      console.log("New conversation created");

      // Save the new conversation
      await conversation.save();
    }

    const theirProfile = await Profile.findById(profileTwoId).select(
      "_id name image username"
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
    res.status(500).send(error.member);
  }
};

export const getAllConversations = async (req, res) => {
  try {
    const profileId = req.params.profileId;
    console.log(profileId);

    const conversations = await DirectConversation.find({
      $or: [{ initiatedBy: profileId }, { initiatedFor: profileId }],
    }).populate([
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
    ]);
    if (res.body) {
      res.body = {
        ...res.body,
        convProfile: conversations,
      };
    } else {
      res.body = { convProfile: conversations };
    }
    res.status(200).send(res.body);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
