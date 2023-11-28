import useAuth from "@/hooks/useAuth";
import { get } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";
import React, { createContext, useEffect, useReducer } from "react";

const initialState = {
  servers: JSON.parse(localStorage.getItem("servers")) || null,
  activeServer: JSON.parse(localStorage.getItem("activeServer")) || null,
  serverDetails: null,
  members: null,
  channels: null,
  loading: true,
  toggled: false,
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
        members: null,
        channels: null,
        loading: true,
        toggled: false,
      };
    case "SET_CUSTOM":
      return { ...state, ...action.payload };
    case "SET_SERVERS":
      return { ...state, servers: action.payload };
    case "SET_ACTIVE_SERVER":
      return { ...state, activeServer: action.payload };
    case "SET_SERVER_DETAILS":
      return { ...state, serverDetails: action.payload };
    case "SET_MEMBERS":
      return { ...state, members: action.payload };
    case "SET_CHANNELS":
      return { ...state, channels: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "TOGGLE_SWITCH":
      return { ...state, toggled: !state.toggled };
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
    default:
      return state;
  }
};

export const ServerContextProvider = ({ children }) => {
  const authDispatch = useAuth("dispatch");
  const user = useAuth("user");
  const access_token = useAuth("token");
  const [state, dispatch] = useReducer(serverReducer, initialState);

  useEffect(() => {
    localStorage.setItem("servers", JSON.stringify(state.servers));
  }, [state.servers]);

  useEffect(() => {
    localStorage.setItem("activeServer", JSON.stringify(state.activeServer));
  }, [state.activeServer]);

  useEffect(() => {
    console.log("SERVER DETAILS CHANGED");
    localStorage.setItem("serverDetails", JSON.stringify(state.serverDetails));
  }, [state.serverDetails]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await get(`/servers/${user}/getAll`, access_token);
        const data = await handleResponse(response, authDispatch);
        const serverIds = Object.keys(data.servers);

        if (serverIds.length > 0)
          dispatch({ type: "SET_SERVERS", payload: data.servers });
        else dispatch({ type: "SET_SERVERS", payload: [] });
      } catch (err) {
        handleError(err, dispatch);
      }
    };

    const fetchData = async () => {
      try {
        const response = await get(
          `/servers/${user}/${state.activeServer}`,
          access_token
        );
        const data = await handleResponse(response, authDispatch);

        dispatch({ type: "SET_SERVER_DETAILS", payload: data.server });
      } catch (err) {
        handleError(err, dispatch);
      }
    };

    if (user && access_token) {
      fetchServers();
      if (state.activeServer) {
        fetchData();
      }
    }
  }, [state.toggled, state.activeServer, user, access_token]);

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
