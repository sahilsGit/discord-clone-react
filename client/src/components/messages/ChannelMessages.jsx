import React, { useRef, useState } from "react";
import { MsWelcome } from "./MsWelcome";
import { get } from "@/services/api-service";
import useAuth from "@/hooks/useAuth";
import { handleError, handleResponse } from "@/lib/response-handler";
import useServer from "@/hooks/useServer";

const ChannelMessages = () => {
  const memberId = useServer("serverDetails").myMembership._id;
  const channelId = useServer("channelDetails")._id;
  const [messages, setMessages] = useState([]);
  const cursorRef = useRef(null);
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const channelDetails = useServer("channelDetails");

  const name = channelDetails?.name;

  const getMessages = async () => {
    try {
      let endpoint = `/messages/fetch&memberId=${memberId}&channelId=${channelId}`;

      if (cursorRef.current) {
        endpoint += `&cursor=${cursorRef.current}`;
      }

      const response = await get(endpoint, access_token);
      const data = handleResponse(response, authDispatch);

      if (data.newCursor) {
        cursorRef.current = res.newCursor;
      }

      setMessages((prev) => [...prev, ...res.messages]);
    } catch (err) {
      handleError(err, authDispatch);
    }
  };

  return (
    <div className="flex-1 flex flex-col py-4 overflow-y-auto">
      <div className="flex-1" />
      <MsWelcome type="channel" name={name} />
    </div>
  );
};

export default ChannelMessages;
