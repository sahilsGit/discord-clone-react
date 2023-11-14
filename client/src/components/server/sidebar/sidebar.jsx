import useServer from "@/hooks/useServer";
import { ServerHeader } from "./serverHeader";

const Sidebar = () => {
  console.log("SIDEBAR MOUNTED");
  const server = useServer("serverDetails");
  console.log("serverDetails", server);

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

  return (
    <div>
      <ServerHeader />
    </div>
  );
};

export default Sidebar;

{
  /* <ServerHeader server={server} role={role} /> */
}
