import React, { createContext, useEffect, useReducer } from "react";

const initialState = {
  channels: null,
  activeChannel: null,
};

const channelsReducer = (state, action) => {
  switch (action.type) {
    case "SET_CHANNELS":
      return { ...state, channels: action.payload };
    case "SET_ACTIVE_CHANNEL":
      return { ...state, activeChannel: action.payload };
    case "SET_CUSTOM":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const ChannelsContext = createContext(initialState);

export const ChannelsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(channelsReducer, initialState);

  const value = {
    ...state,
    dispatch,
  };

  useEffect(() => {
    localStorage.setItem("channels", JSON.stringify(state.channels));
  }, [state.channels]);

  useEffect(() => {
    localStorage.setItem("activeChannel", JSON.stringify(state.activeChannel));
  }, [state.activeChannel]);

  return (
    <ChannelsContext.Provider value={value}>
      {children}
    </ChannelsContext.Provider>
  );
};
