import DropdownTrigger from "./dropdownMenu/dropDownTrigger";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";
import ProfileControl from "@/components/profileControl";
import ServerScrollArea from "./serverScrollArea";
import ServerSearch from "./serverSearch";

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
  const activeServer = useServer("activeServer");
  const profileId = useAuth("id");

  const textChannels = activeServer?.channels.filter(
    (channel) => channel.type === "TEXT"
  );

  const audioChannels = activeServer?.channels.filter(
    (channel) => channel.type === "AUDIO"
  );

  const videoChannels = activeServer?.channels.filter(
    (channel) => channel.type === "VIDEO"
  );

  const members = activeServer?.members.filter(
    (member) => member.profile?._id !== profileId
  );

  const role = activeServer.members.find((member) => {
    return member.profile?._id === profileId;
  })?.role;

  const data = [
    {
      label: "Text Channels",
      contentArray: textChannels?.map((channel) => ({
        id: channel._id,
        name: channel.name,
        icon: iconMap[channel.type],
        channelType: channel.type,
        conversationId: channel.conversationId,
      })),
    },
    {
      label: "Voice Channels",
      contentArray: audioChannels?.map((channel) => ({
        id: channel._id,
        name: channel.name,
        icon: iconMap[channel.type],
        channelType: channel.type,
        conversationId: channel.conversationId,
      })),
    },
    {
      label: "Video Channels",
      type: "channel",
      contentArray: videoChannels?.map((channel) => ({
        id: channel._id,
        name: channel.name,
        icon: iconMap[channel.type],
        channelType: channel.type,
        conversationId: channel.conversationId,
      })),
    },
    {
      label: "Members",
      contentArray: members?.map((member) => ({
        id: member._id,
        name: member.profile?.name,
        icon: roleIconMap[member.role],
        profileId: member.profileId,
      })),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="h-[48px]">
        <DropdownTrigger role={role} />
      </div>
      <ServerSearch data={data} />
      <ServerScrollArea data={data} role={role} />
      <div className="h-53px">
        <ProfileControl />
      </div>
    </div>
  );
};

export default ServerSidebar;
