import useAuth from "@/hooks/useAuth";
import { get } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";
import React, { createContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";

const initialState = {
  servers: null, // Holds basic details of all the server the user is member of
  activeServer: JSON.parse(localStorage.getItem("activeServer")) || null, // Holds Id of the currently active server
  activeChannel: null, // Holds Id of the currently active channel
  serverDetails: null, // Holds the activeServer's comprehensive details
  serverCandidate: null, // Holds the serverId (temporarily) that's candidate for being the next activeServer
  channelCandidate: null, // Holds the channelId (temporarily) that's candidate for being the next activeChannel
  loading: true, //
};

export const ServerContext = createContext(initialState);

const serverReducer = (state, action) => {
  console.log("RECIEVED SERVER DISPATCH:", action);
  switch (action.type) {
    case "RESET_STATE":
      return {
        servers: null,
        activeServer: null,
        serverDetails: null,
        activeChannel: null,
        serverCandidate: null,
        channelCandidate: null,
        loading: true,
      };
    case "SET_CUSTOM":
      return { ...state, ...action.payload };
    case "SET_SERVERS":
      return { ...state, servers: action.payload };
    case "SET_ACTIVE_SERVER":
      return { ...state, activeServer: action.payload };
    case "SET_SERVER_CANDIDATE":
      return { ...state, serverCandidate: action.payload };
    case "SET_CHANNEL_CANDIDATE":
      return { ...state, channelCandidate: action.payload };
    case "SET_SERVER_DETAILS":
      return { ...state, serverDetails: action.payload };
    case "SET_ACTIVE_CHANNEL":
      return { ...state, activeChannel: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "ADD_MEMBERS":
      return {
        ...state,
        serverDetails: {
          ...state.serverDetails,
          members: [...state.serverDetails.members, ...action.payload],
        },
      };
    case "UPDATE_MEMBER":
      const memberIndex = state.serverDetails.members.findIndex(
        (member) => member.id === action.payload.id
      );
      if (memberIndex !== -1) {
        return {
          ...state,
          serverDetails: {
            ...state.serverDetails,
            members: [
              ...state.serverDetails.members.slice(0, memberIndex),
              action.payload,
              ...state.serverDetails.members.slice(memberIndex + 1),
            ],
          },
        };
      }
    case "REMOVE_MEMBER":
      const updatedMembers = state.serverDetails.members.filter(
        (member) => member.id !== action.payload.memberId
      );
      return {
        ...state,
        serverDetails: {
          ...state.serverDetails,
          members: updatedMembers,
        },
      };
    default:
      return state;
  }
};

export const ServerContextProvider = ({ children }) => {
  const authDispatch = useAuth("dispatch");
  const user = useAuth("user");
  const access_token = useAuth("token");
  const [state, dispatch] = useReducer(serverReducer, initialState);
  const profileId = useAuth("id");
  const navigate = useNavigate();

  const fetchServers = async () => {
    try {
      const response = await get(`/servers/${user}/getAll`, access_token);
      const data = await handleResponse(response, authDispatch, dispatch);
      const serverIds = Object.keys(data.servers);

      if (serverIds.length > 0)
        dispatch({ type: "SET_SERVERS", payload: data.servers });
      else dispatch({ type: "SET_SERVERS", payload: null });
    } catch (err) {
      handleError(err, dispatch);
    }
  };

  const fetchData = async () => {
    try {
      console.log("fetching", state.serverCandidate);
      const response = await get(
        `/servers/${user}/${
          state.serverCandidate ? state.serverCandidate : state.activeServer
        }`,
        access_token
      );

      const data = await handleResponse(response, authDispatch, dispatch);
      console.log(
        "got response",
        data,
        "channelCAndidate: ",
        state.channelCandidate,
        "serverCandidate: ",
        state.serverCandidate,
        "activeServer: ",
        state.activeServer
      );

      if (state.channelCandidate) {
        const channelExists = data.server.channels.some(
          (channel) => channel._id === state.channelCandidate
        );

        if (channelExists) {
          dispatch({
            type: "SET_CUSTOM",
            payload: {
              serverDetails: data.server,
              activeServer: state.serverCandidate
                ? state.serverCandidate
                : state.activeServer,
              serverCandidate: null,
              activeChannel: state.channelCandidate,
              channelCandidate: null,
            },
          });
          return;
        }
      }

      dispatch({
        type: "SET_CUSTOM",
        payload: {
          serverDetails: data.server,
          activeServer: state.serverCandidate
            ? state.serverCandidate
            : state.activeServer,
          serverCandidate: null,
          activeChannel: data.server.channels[0]._id,
          channelCandidate: null,
        },
      });
    } catch (err) {
      const errCode = handleError(err, dispatch);

      if (errCode === 404) {
        state.activeServer
          ? navigate(`/servers/${state.activeServer}`)
          : navigate(`/@me`);
      }
    }
  };

  useEffect(() => {
    if (user && access_token && profileId) {
      fetchServers();
      if (state.serverCandidate || state.channelCandidate) fetchData();
    }
  }, [
    state.serverCandidate,
    state.channelCandidate,
    access_token,
    user,
    profileId,
  ]);

  useEffect(() => {
    localStorage.setItem("activeServer", JSON.stringify(state.activeServer));
  }, [state.activeServer]);

  useEffect(() => {
    localStorage.setItem("activeChannel", JSON.stringify(state.activeChannel));
  }, [state.activeChannel]);

  useEffect(() => {
    localStorage.setItem("serverDetails", JSON.stringify(state.serverDetails));
  }, [state.serverDetails]);

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
