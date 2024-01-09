import useAuth from "@/hooks/useAuth";
import { get } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";
import React, { createContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";

const initialState = {
  servers: JSON.parse(localStorage.getItem("servers")) || null, // Holds basic details of all the server the user is member of
  serverDetails: null, // Holds the activeServer's comprehensive details
  channelDetails: null,
};

export const ServerContext = createContext(initialState);

const serverReducer = (state, action) => {
  console.log("RECEIVED SERVER DISPATCH:", action);
  switch (action.type) {
    case "SET_SERVERS":
      return { ...state, servers: action.payload };
    case "SET_SERVER_DETAILS":
      return { ...state, serverDetails: action.payload };
    case "SET_CHANNEL_DETAILS":
      return { ...state, channelDetails: action.payload };
    case "RESET_STATE":
      return {
        servers: null,
        serverDetails: null,
        channelDetails: null,
      };
    case "SET_CUSTOM":
      return { ...state, ...action.payload };
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
      const data = await handleResponse(response, authDispatch);

      console.log("data", data);

      const serverIds = Object.keys(data.servers);

      if (serverIds.length > 0)
        dispatch({ type: "SET_SERVERS", payload: data.servers });
      else dispatch({ type: "SET_SERVERS", payload: null });
    } catch (err) {
      handleError(err, authDispatch);
    }
  };

  useEffect(() => {
    localStorage.setItem("serverDetails", JSON.stringify(state.serverDetails));
  }, [state.serverDetails]);

  useEffect(() => {
    localStorage.setItem(
      "channelDetails",
      JSON.stringify(state.channelDetails)
    );

    if (state.serverDetails && state.channelDetails) {
      navigate(
        `/servers/${state.serverDetails.id}/${state.channelDetails._id}`
      );
    }
  }, [state.channelDetails]);

  useEffect(() => {
    localStorage.setItem("servers", JSON.stringify(state.servers));
  }, [state.servers]);

  useEffect(() => {
    if (access_token && user && profileId) fetchServers();
  }, [access_token, user, profileId]);

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
