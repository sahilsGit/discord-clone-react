import React from "react";
import useServer from "@/hooks/useServer";
import MnInput from "./mnInput";
import ChannelHeader from "../channel/header/channelHeader";

const ChannelMain = ({ type, data }) => {
  const serverDetails = useServer("serverDetails");
  if (!serverDetails) {
    return <p>loading.....</p>;
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      <ChannelHeader type={type} data={data} />
      <div></div>
      <MnInput />
    </div>
  );
};

export default ChannelMain;
