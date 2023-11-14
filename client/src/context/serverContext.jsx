import React, { createContext, useEffect, useMemo, useReducer } from "react";

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
  console.log("INSIDE SERVER CONTEXT");
  const [state, dispatch] = useReducer(serverReducer, initialState);

  useEffect(() => {
    localStorage.setItem("servers", JSON.stringify(state.servers));
  }, [state.servers]);

  useEffect(() => {
    localStorage.setItem("activeServer", JSON.stringify(state.activeServer));
  }, [state.activeServer]);

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      dispatch,
    }),
    [state, dispatch]
  );

  if (state.loading) {
    return <div>Loading...</div>;
  }

  return (
    <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
  );
};
