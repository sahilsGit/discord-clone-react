import { ServerHeader } from "./serverHeader";
import SidebarScrollArea from "./sidebarScrollArea";
import ServerSearch from "./serverSearch";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import useServer from "@/hooks/useServer";

const iconMap = {
  TEXT: <Hash className="mr-2 h-4 w-4" />,
  AUDIO: <Mic className="mr-2 h-4 w-4" />,
  VIDEO: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
};

const ServerSidebar = () => {
  const server = useServer("serverDetails");
  const activeServer = useServer("activeServer");

  const textChannels = server?.channels.filter(
    (channel) => channel.type === "TEXT"
  );

  const audioChannels = server?.channels.filter(
    (channel) => channel.type === "AUDIO"
  );

  const videoChannels = server?.channels.filter(
    (channel) => channel.type === "VIDEO"
  );

  const members = server?.members.filter(
    (member) => member.profileId !== activeServer
  );

  return (
    <div>
      <ServerHeader />
      <ServerSearch
        data={[
          {
            label: "Text Channels",
            data: textChannels?.map((channel) => ({
              id: channel._id,
              name: channel.name,
              icon: iconMap[channel.type],
            })),
          },
          {
            label: "Voice Channels",
            data: audioChannels?.map((channel) => ({
              id: channel._id,
              name: channel.name,
              icon: iconMap[channel.type],
            })),
          },
          {
            label: "Video Channels",
            type: "channel",
            data: videoChannels?.map((channel) => ({
              id: channel._id,
              name: channel.name,
              icon: iconMap[channel.type],
            })),
          },
          {
            label: "Members",
            data: members?.map((member) => ({
              id: member.id,
              name: member.name,
              icon: roleIconMap[member.role],
            })),
          },
        ]}
      />
      <SidebarScrollArea />
    </div>
  );
};

export default ServerSidebar;
