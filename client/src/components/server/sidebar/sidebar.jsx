import useAuth from "@/hooks/useAuth";
import { get } from "@/services/apiService";
import { handleError, handleResponse } from "@/services/responseHandler";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ServerHeader } from "./serverHeader";

const Sidebar = ({ alreadyFetched }) => {
  const [hasFetched, setHasFetched] = useState(false);
  const params = useParams();
  const profile = useAuth("user");
  const access_token = useAuth("token");
  const dispatch = useAuth("dispatch");
  const navigate = useNavigate();

  const [server, setServer] = useState({});

  if (!profile || !access_token) {
    return navigate("/login");
  }

  useEffect(() => {
    if (!alreadyFetched) {
      return navigate("/"); // TODO
    }

    if (alreadyFetched.id === params.id) {
      setServer({
        name: alreadyFetched.name,
        id: alreadyFetched.id,
        channels: alreadyFetched.channels,
        members: alreadyFetched.members,
      });
      setHasFetched(true);

      return;
    }
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        };

        const response = await get(
          `/profile/${profile}/${params.id}`,
          headers,
          {
            credentials: "include",
          }
        );

        const data = await handleResponse(response, dispatch);
        setServer(data.server);
        console.log("Here's servers, check if channels are there", server);
        setHasFetched(true);
      } catch (err) {
        handleError(err);
        return navigate("/login");
      }
    };

    fetchData();
  }, [access_token, profile.profileId, dispatch, params.id, navigate]);

  if (!hasFetched) {
    // You can return a loading indicator or any UI element to indicate that data is being fetched.
    return <div>Loading...</div>;
  }

  const textChannels = server?.channels.filter(
    (channel) => channel.type === "TEXT"
  );

  const audioChannels = server?.channels.filter(
    (channel) => channel.type === "AUDIO"
  );

  const videoChannels = server?.channels.filter(
    (channel) => channel.type === "VIDEO"
  );

  const members = server?.members.filter(
    (member) => member.profileId !== profile.profileId
  );

  if (!server) {
    return navigate("/");
  }

  const role = server.members.find(
    (member) => member.profileId === profile.profileId
  )?.role;

  return (
    <div>
      <ServerHeader server={server} role={role} />
      <div>{server.members[0]}</div>
    </div>
  );
};

export default Sidebar;
