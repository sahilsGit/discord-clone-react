import { Conversation, Member, Profile } from "../modals/Schema.js";

export const findConversation = async (req, res) => {
  try {
    // const { memberOneId, memberTwoId } = req.params;
    const memberOneId = req.params.memberOneId;
    const memberTwoId = req.params.memberTwoId;

    if (memberOneId === memberTwoId) {
      return res
        .status(201)
        .send("You can't initiate conversation with yourself");
    }

    let conversation;
    let populatedMember;

    // Check if a conversation already exists
    conversation = await Conversation.findOne({
      $or: [
        { memberOneId, memberTwoId },
        { memberOneId: memberTwoId, memberTwoId: memberOneId },
      ],
    });

    if (!conversation) {
      console.log("initiating conversation");

      // Conversation does not exist, create a new one
      conversation = new Conversation({
        memberOneId,
        memberTwoId,
        directMessages: [], // You can add other necessary fields here
        createdAt: new Date(),
      });

      // Save the new conversation
      await conversation.save();
    }

    populatedMember = await Member.findById(memberTwoId).populate({
      path: "profileId",
      select: "_id name image username",
    });

    if (res.body) {
      res.body = {
        ...res.body,
        memberProfile: populatedMember.profileId,
        conversation: conversation,
      };
    } else {
      res.body = {
        memberProfile: populatedMember.profileId,
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
    const memberId = req.params.memberId;

    const conversationsInitiated = await Member.aggregate([
      // Get the member document
      {
        $match: {
          _id: ObjectId(`${memberId}`),
        },
      },

      // Look for memberId
      {
        $lookup: {
          from: "conversation",
          as: "conversations",
          localField: "_id",
          foreignField: "memberOneId",
        },
      },

      // Filter out unwanted fields
      {
        $project: {
          _id: 0,
          conversations: {
            memberTwoId: 1,
          },
        },
      },

      //
    ]);

    // const conversationsReceived = await Member.populate({
    //   path: "conversationsReceived",
    //   match: { _id: memberId },
    //   select: {
    //     memberOneId: 1,
    //     _id: 0,
    //   },
    //   populate: {
    //     path: "memberOneId",
    //     select: {
    //       profileId: 1,
    //       _id: 0,
    //     },
    //   },
    // });

    // Combine the initiated and received conversations
    const allConversations = conversationsInitiated.concat(
      conversationsReceived
    );

    if (res.body) {
      res.body = {
        ...res.body,
        convProfile: aj,
      };
    } else {
      res.body = { convProfile: aj };
    }

    res.status(200).send(res.body);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// conversation = await Conversation.aggregate([
//   {
//     $match: {
//       $or: [
//         {
//           $and: [
//             { memberOneId: ObjectId("6567fd75436d90e52c023915") },
//             { memberTwoId: ObjectId("6568a16559279ef436fe1d51") },
//           ],
//         },
//         {
//           $and: [
//             { memberOneId: ObjectId("6568a16559279ef436fe1d51") },
//             { memberTwoId: ObjectId("6567fd75436d90e52c023915") },
//           ],
//         },
//       ],
//     },
//   },
//   {
//     $lookup: {
//       from: "members",
//       let: { memberId: "$memberTwoId" },
//       pipeline: [
//         {
//           $match: {
//             $expr: { $eq: ["$_id", "$$memberId"] }, // Check if _id matches the member ID
//           },
//         },
//       ],
//       as: "memberInfo",
//     },
//   },
//   {
//     $lookup: {
//       from: "profiles",
//       as: "ProfileInfo",
//       localField: "memberInfo.profileId",
//       foreignField: "_id",
//     },
//   },
//   {
//     $project: {
//       _id: 0,
//       ProfileInfo: 1,
//     },
//   },
// ]);
