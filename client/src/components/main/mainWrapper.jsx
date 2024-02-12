import React from "react";
import MainServer from "./mainServer";
import MainConversation from "./mainConversation";

const MainWrapper = ({ type, mainData }) => {
  /*
   * Wraps the mainPage's complete main area (whole mainPage minus sidebars)
   * Determines the "type" and supplies the mainData accordantly
   */
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
