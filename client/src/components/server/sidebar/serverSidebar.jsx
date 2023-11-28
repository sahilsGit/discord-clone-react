import useServer from "@/hooks/useServer";
import { ServerHeader } from "./serverHeader";
import { useEffect } from "react";

const ServerSidebar = () => {
  console.log("SIDEBAR MOUNTED");
  const server = useServer("serverDetails");

  // const textChannels = server?.channels.filter(
  //   (channel) => channel.type === "TEXT"
  // );

  // const audioChannels = server?.channels.filter(
  //   (channel) => channel.type === "AUDIO"
  // );

  // const videoChannels = server?.channels.filter(
  //   (channel) => channel.type === "VIDEO"
  // );

  // const members = server?.members.filter(
  //   (member) => member.profileId !== profileId
  // );

  useEffect(() => {
    console.log("SERVER SIDEBAR MOUNTED");
  });

  return (
    <div>
      <ServerHeader />
    </div>
  );
};

export default ServerSidebar;

{
  /* <ServerHeader server={server} role={role} /> */
}
