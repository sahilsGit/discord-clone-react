import useAuth from "@/hooks/useAuth";
import { get } from "@/services/apiService";
import { handleError, handleResponse } from "@/services/responseHandler";
import React, { createContext, useEffect, useReducer } from "react";

const initialState = {
  servers: JSON.parse(localStorage.getItem("servers")) || null,
  activeServer: JSON.parse(localStorage.getItem("activeServer")) || null,
  serverDetails: null,
  members: null,
  channels: null,
  loading: true,
};

export const ServerContext = createContext(initialState);

const serverReducer = (state, action) => {
  switch (action.type) {
    case "SET_CUSTOM":
      return { ...state, ...action.payload };
    case "SET_SERVERS":
      return { ...state, serverArray: action.payload };
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
    default:
      return state;
  }
};

export const ServerContextProvider = ({ children }) => {
  const user = useAuth("user");
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");

  console.log("INSIDE SERVER CONTEXT");
  const [state, dispatch] = useReducer(serverReducer, initialState);

  useEffect(() => {
    localStorage.setItem("servers", JSON.stringify(state.servers));
  }, [state.servers]);

  useEffect(() => {
    localStorage.setItem("activeServer", JSON.stringify(state.activeServer));
  }, [state.activeServer]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetching server details");
      try {
        const response = await get(
          `/servers/${user}/${state.activeServer}`,
          access_token
        );
        const data = await handleResponse(response, authDispatch);
        console.log("dispatching");
        dispatch({ type: "SET_SERVER_DETAILS", payload: data.server });
      } catch (err) {
        handleError(err);
      }
    };

    if (state.activeServer) {
      fetchData();
    }
  }, [state.activeServer]);

  useEffect(() => {
    console.log("SERVER CONTEXT MOUNTED");
  }, []);

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
