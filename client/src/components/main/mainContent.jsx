import React from "react";

const MainContent = ({ type }) => {
  return (
    <div>{type === "messages" ? <div>messages</div> : <div>channel</div>}</div>
  );
};

export default MainContent;
