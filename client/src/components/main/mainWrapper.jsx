import React from "react";
import MainServer from "./mainServer";
import MainConversation from "./mainConversation";

const MainWrapper = ({ type, channelType }) => {
  console.log("MAIN_WRAPPER");

  console.log(type);
  return (
    <div className="h-full">
      {type === "channel" || type === "server" ? (
        <MainServer type={type} channelType={channelType} />
      ) : (
        <MainConversation type={type} />
      )}
    </div>
  );
};

export default MainWrapper;
