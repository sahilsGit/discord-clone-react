import DirectConversation from "../modals/directConversation.modals.js";
import Profile from "../modals/profile.modals.js";

export const getOrCreateConversation = async (req, res) => {
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
    res.status(500).send(error.message);
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

// export const findConversationById = async (req, res) => {
//   try {
//     const conversationId = req.params.conversationId;

//     // Check if a conversation with the given ID exists
//     const conversation = await DirectConversation.findById(conversationId);

//     if (!conversation) {
//       return res.status(404).send("Conversation not found");
//     }

//     const profileOneId = conversation.initiatedBy;
//     const profileTwoId = conversation.initiatedFor;

//     const theirProfile = await Profile.findById(
//       profileTwoId === req.user.profileId ? profileOneId : profileTwoId
//     ).select("_id name image username");

//     if (res.body) {
//       res.body = {
//         ...res.body,
//         memberProfile: theirProfile,
//         conversation: conversation,
//       };
//     } else {
//       res.body = {
//         memberProfile: theirProfile,
//         conversation: conversation,
//       };
//     }
//     res.status(200).send(res.body);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// };
