import React from "react";
import MainServer from "./mainServer";
import MainConversation from "./mainConversation";

const MainWrapper = ({ type, mainData }) => {
  return (
    <div className="h-full">
      {type === "conversation" ? (
        <MainConversation type={type} activeConversation={mainData} />
      ) : (
        <MainServer type={type} activeChannel={mainData} />
      )}
    </div>
  );
};

export default MainWrapper;
