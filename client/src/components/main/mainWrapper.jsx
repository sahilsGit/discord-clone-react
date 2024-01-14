import React from "react";
import MainServer from "./mainServer";
import MainConversation from "./mainConversation";

const MainWrapper = ({ type }) => {
  console.log("MAIN_WRAPPER");
  return (
    <div className="h-full">
      {type === "channel" || type === "server" ? (
        <MainServer type={type} />
      ) : (
        <MainConversation />
      )}
    </div>
  );
};

export default MainWrapper;
