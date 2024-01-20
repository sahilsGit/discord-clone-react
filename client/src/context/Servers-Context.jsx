// import useAuth from "@/hooks/useAuth";
// import { get } from "@/services/api-service";
// import { handleError, handleResponse } from "@/lib/response-handler";
import React, { createContext, useEffect, useReducer } from "react";
// import { useNavigate, useParams } from "react-router-dom";

const initialState = {
  servers: JSON.parse(localStorage.getItem("servers")) || null, // Holds basic details of all the server the user is member of
  activeServer: null, // Holds the activeServer's comprehensive details
  channels: null,
  activeChannel: null,
};

export const ServerContext = createContext(initialState);

const serverReducer = (state, action) => {
  console.log("RECEIVED SERVER DISPATCH:", action);
  console.log(state);

  switch (action.type) {
    case "SET_SERVERS":
      return { ...state, servers: action.payload };
    case "SET_ACTIVE_SERVER":
      return { ...state, activeServer: action.payload };
    case "SET_CHANNELS":
      return { ...state, channels: action.payload };
    case "SET_ACTIVE_CHANNEL":
      return { ...state, activeChannel: action.payload };
    case "RESET_STATE":
      return {
        servers: null,
        activeServer: null,
        channels: null,
        activeChannel: null,
      };
    case "SET_CUSTOM":
      return { ...state, ...action.payload };
    case "ADD_MEMBERS":
      return {
        ...state,
        activeServer: {
          ...state.activeServer,
          members: [...state.activeServer.members, ...action.payload],
        },
      };
    case "UPDATE_MEMBER":
      const memberIndex = state.activeServer.members.findIndex(
        (member) => member.id === action.payload.id
      );
      if (memberIndex !== -1) {
        return {
          ...state,
          activeServer: {
            ...state.activeServer,
            members: [
              ...state.activeServer.members.slice(0, memberIndex),
              action.payload,
              ...state.activeServer.members.slice(memberIndex + 1),
            ],
          },
        };
      }
    case "REMOVE_MEMBER":
      const updatedMembers = state.activeServer.members.filter(
        (member) => member.id !== action.payload.memberId
      );
      return {
        ...state,
        activeServer: {
          ...state.activeServer,
          members: updatedMembers,
        },
      };
    default:
      return state;
  }
};

export const ServerContextProvider = ({ children }) => {
  // const authDispatch = useAuth("dispatch");
  // const user = useAuth("user");
  // const access_token = useAuth("token");
  const [state, dispatch] = useReducer(serverReducer, initialState);
  // const profileId = useAuth("id");
  // const navigate = useNavigate();

  // const url = new URL(window.location.href);
  // const segments = url.pathname.split("/");
  // const serverId = segments[2];
  // const channelId = segments[3];

  // const fetchServers = async () => {
  //   try {
  //     const response = await get(`/servers/${user}/getAll`, access_token);
  //     const data = await handleResponse(response, authDispatch);

  //     const serverIds = Object.keys(data.servers);

  //     if (serverIds.length > 0)
  //       dispatch({ type: "SET_SERVERS", payload: data.servers });
  //     else dispatch({ type: "SET_SERVERS", payload: null });
  //   } catch (err) {
  //     handleError(err, authDispatch);
  //   }
  // };

  // useEffect(() => {
  //   localStorage.setItem("activeChannel", JSON.stringify(state.activeChannel));

  //   if (
  //     state.activeServer &&
  //     state.activeChannel &&
  //     (serverId !== state.activeServer.id ||
  //       channelId !== state.activeChannel._id)
  //   ) {
  //     navigate(`/servers/${state.activeServer.id}/${state.activeChannel._id}`);
  //   }
  // }, [state.activeChannel]);

  useEffect(() => {
    localStorage.setItem("servers", JSON.stringify(state.servers));
  }, [state.servers]);

  useEffect(() => {
    localStorage.setItem("activeServer", JSON.stringify(state.activeServer));
  }, [state.activeServer]);

  useEffect(() => {
    localStorage.setItem("channels", JSON.stringify(state.channels));
  }, [state.channels]);

  useEffect(() => {
    localStorage.setItem("activeChannel", JSON.stringify(state.activeChannel));
  }, [state.activeChannel]);

  // useEffect(() => {
  //   if (access_token && user && profileId) fetchServers();
  // }, [access_token, user, profileId]);

  return (
    <ServerContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};
