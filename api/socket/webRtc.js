import { AccessToken } from "livekit-server-sdk";

const getToken = async (req, res) => {
  const createToken = () => {
    // if this room doesn't exist, it'll be automatically created when the first
    // client joins
    const roomName = "quickstart-room";
    // identifier to be used for participant.
    // it's available as LocalParticipant.identity with livekit-client SDK
    const participantName = "quickstart-username";

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
    const token = createToken();
    res.status(200).send({ token: token });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export { getToken };
