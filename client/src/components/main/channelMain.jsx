import React from "react";
import MnInput from "./mnInput";
import ChannelHeader from "../channel/header/channelHeader";

const ChannelMain = ({ type }) => {
  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      <ChannelHeader type={type} />
      <div></div>
      <MnInput />
    </div>
  );
};

export default ChannelMain;
