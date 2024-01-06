import { ChTrigger } from "./dropdownMenu/chTrigger";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";
import ProfileControl from "@/components/profileControl";
import ChScrollArea from "./chScrollArea";
import ChSearch from "./chSearch";

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

const ChannelSidebar = () => {
  const server = useServer("serverDetails");
  const profileId = useAuth("id");

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
    (member) => member.profileId !== profileId
  );

  const role = server.members.find((member) => {
    return member.profileId === profileId;
  })?.role;

  const data = [
    {
      label: "Text Channels",
      contentArray: textChannels?.map((channel) => ({
        id: channel._id,
        name: channel.name,
        icon: iconMap[channel.type],
      })),
    },
    {
      label: "Voice Channels",
      contentArray: audioChannels?.map((channel) => ({
        id: channel._id,
        name: channel.name,
        icon: iconMap[channel.type],
      })),
    },
    {
      label: "Video Channels",
      type: "channel",
      contentArray: videoChannels?.map((channel) => ({
        id: channel._id,
        name: channel.name,
        icon: iconMap[channel.type],
      })),
    },
    {
      label: "Members",
      contentArray: members?.map((member) => ({
        id: member.id,
        name: member.name,
        icon: roleIconMap[member.role],
        profileId: member.profileId,
      })),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="h-[48px]">
        <ChTrigger role={role} />
      </div>
      <ChSearch data={data} />
      <ChScrollArea data={data} role={role} />
      <div className="h-53px">
        <ProfileControl />
      </div>
    </div>
  );
};

export default ChannelSidebar;
