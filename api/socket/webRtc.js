import { AccessToken } from "livekit-server-sdk";

const getToken = async (req, res) => {
  const createToken = (channelId, username) => {
    // if this room doesn't exist, it'll be automatically created when the first
    // client joins
    const roomName = channelId;
    // identifier to be used for participant.
    // it's available as LocalParticipant.identity with livekit-client SDK
    const participantName = username;

    const at = new AccessToken(
      process.env.LK_API_KEY,
      process.env.LK_API_SECRET,
      {
        identity: participantName,
      }
    );
    at.addGrant({ roomJoin: true, room: roomName });

    return at.toJwt();
  };

  try {
    const { channelId, username } = req.query;

    const token = createToken(channelId, username);
    res.status(200).send({ token: token });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export { getToken };
