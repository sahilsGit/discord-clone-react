import "@livekit/components-styles";
import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { useEffect, useState } from "react";
import { get } from "@/services/api-service";
import useAuth from "@/hooks/useAuth";
import { handleResponse } from "@/lib/response-handler";
import { VideoCallMain } from "./videoCallMain";
import useServer from "@/hooks/useServer";

const serverUrl = import.meta.env.VITE_API_LK_SERVER_URI;

export default function VideoCallWrapper({ channelId }) {
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const [token, setToken] = useState(null);
  const myMembership = useServer("activeServer").myMembership;

  console.log(token);
  console.log(serverUrl);

  useEffect(() => {
    console.log("fetching tokennnn");
    const getToken = async () => {
      const response = await get(
        `/getToken?channelId=${channelId}&memberId=${myMembership._id}`,
        access_token
      );
      const data = await handleResponse(response, authDispatch);

      setToken(data.token);
    };

    getToken();
  }, []);

  if (!token) {
    return null;
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
      style={{ height: "100vh" }}
    >
      {/* Your custom component with basic video conferencing functionality. */}
      <VideoCallMain />
      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer />
      {/* Controls for the user to start/stop audio, video, and screen 
      share tracks and to leave the room. */}
      <ControlBar />
    </LiveKitRoom>
  );
}
