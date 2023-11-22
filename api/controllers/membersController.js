import { Member, Profile, Server } from "../modals/Schema.js";

export const changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    console.log("role that came", role);
    // Check if the server exists
    const server = await Server.findById(req.params.serverId);
    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    // Check if the member exists in the server's members array
    if (!server.members.includes(req.params.memberId)) {
      return res.status(404).json({ error: "Member not found in the server" });
    }

    // Update the member's role in the Member collection
    const updatedMember = await Member.findById(
      req.params.memberId
      // This option returns the updated document
    );

    updatedMember.role = role;
    await updatedMember.save();

    console.log("will look for pofile now");

    const profile = await Profile.findById(updatedMember.profileId).select(
      "image name email"
    );

    const memberPayloadToSend = {
      email: profile.email,
      name: profile.name,
      id: updatedMember._id,
      profileId: updatedMember.profileId,
      role: updatedMember.role,
      image: profile.image ? profile.image : null,
    };

    console.log("paaaalllll", memberPayloadToSend);

    if (res.body) {
      res.body = { ...res.body, member: memberPayloadToSend };
    } else {
      res.body = { member: memberPayloadToSend };
    }

    res.status(200).send(res.body);
  } catch (err) {
    res.send(err.message);
  }
};
