import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import { handleError, handleResponse } from "@/lib/response-handler";
import { get, post } from "@/services/api-service";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const InvitationPage = () => {
  const params = useParams();
  const user = useAuth("user");
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const [serverPage, setServerPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState();
  const navigate = useNavigate();
  const serverDispatch = useServer("dispatch");

  useEffect(() => {
    const findServer = async () => {
      try {
        const response = await get(
          `/servers/${user}/find/${params.inviteCode}`,
          access_token
        );
        const data = await handleResponse(
          response,
          authDispatch,
          serverDispatch
        );
        data.exists ? setExists(true) : setExists(false);
        setLoading(false);
        setServerPage(data.serverId);
      } catch (error) {
        handleError(error, authDispatch);
      }
    };

    findServer();
  }, [params.inviteCode]);

  const acceptInvite = async () => {
    try {
      const response = await post(
        `/servers/${serverPage}/acceptInvite`,
        null,
        access_token
      );
      await handleResponse(response, authDispatch);
      // navigate(`/servers/${serverPage}`);
      navigate(`/@me/conversations`);
    } catch (error) {
      handleError;
    }
  };

  return loading ? (
    <p>Loading...</p>
  ) : exists ? (
    <button
      onClick={() => {
        navigate(`/servers/${serverPage}`);
      }}
    >
      Go there
    </button>
  ) : (
    <button onClick={acceptInvite}>Join</button>
  );
};

export default InvitationPage;
