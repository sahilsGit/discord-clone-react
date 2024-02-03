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
import { CallMain } from "./callMain";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";

const serverUrl = import.meta.env.VITE_API_LK_SERVER_URI;

export default function CallWrapper({ channelId, video }) {
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const [token, setToken] = useState(null);
  const user = useAuth("user");

  useEffect(() => {
    const getToken = async () => {
      const response = await get(
        `/getToken?channelId=${channelId}&username=${user}`,
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
      video={video}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
    >
      {/* Your custom component with basic video conferencing functionality. */}
      <CallMain />
      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer />
      {/* Controls for the user to start/stop audio, video, and screen 
      share tracks and to leave the room. */}
      <Sheet>
        <SheetTrigger className="absolute top-20 right-1">
          <Button className="h-[80px] rounded-r-none rounded-l-full px-1 bg-zinc-400">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[220px] px-1 flex items-center justify-center">
          <ControlBar className="flex flex-col" />
        </SheetContent>
      </Sheet>
    </LiveKitRoom>
  );
}
