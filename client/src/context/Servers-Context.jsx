import React, { createContext, useEffect, useReducer } from "react";

const initialState = {
  servers: JSON.parse(localStorage.getItem("servers")) || null, // Holds basic details of all the server the user is member of
  activeServer: null, // Holds the activeServer's comprehensive details
  cache: null,
};

export const ServerContext = createContext(initialState);

const serverReducer = (state, action) => {
  console.log("RECEIVED SERVER DISPATCH:", action);

  switch (action.type) {
    case "SET_SERVERS":
      return { ...state, servers: action.payload };
    case "SET_ACTIVE_SERVER":
      return { ...state, activeServer: action.payload };
    case "RESET_STATE":
      return {
        servers: null,
        activeServer: null,
        channels: null,
        activeChannel: null,
      };
    case "REMOVE_ACTIVE_SERVER":
      return {
        ...state,
        activeServer: null,
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
    case "ADD_TO_CACHE":
      return {
        ...state,
        activeServer: null,
        cache: {
          activeServer: state.activeServer,
        },
      };
    case "USE_CACHE":
      return {
        ...state,
        activeServer: state.cache.activeServer,
        cache: null,
      };
    default:
      return state;
  }
};

export const ServerContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(serverReducer, initialState);

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

  useEffect(() => {
    localStorage.setItem("serverCache", JSON.stringify(state.cache));
  }, [state.cache]);

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
