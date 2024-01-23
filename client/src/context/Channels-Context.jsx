import { fetchAllConversations, fetchAllServers } from "@/api";
import useAuth from "@/hooks/useAuth";
import React, { createContext, useEffect, useReducer } from "react";

const initialState = {
  channels: null,
  activeChannel: null,
  messages: null,
  cursor: null,
  hasMore: null,
  cache: null,
};

const channelsReducer = (state, action) => {
  switch (action.type) {
    case "SET_CHANNELS":
      return { ...state, channels: action.payload };
    case "SET_ACTIVE_CHANNEL":
      return { ...state, activeChannel: action.payload };
    case "SET_MESSAGES":
      return {
        ...state,
        messages: action.payload.messages,
        cursor: action.payload.cursor,
        hasMore: action.payload.hasMore,
      };
    case "SET_CUSTOM":
      return { ...state, ...action.payload };
    case "ADD_TO_CACHE":
      return {
        ...state,
        channels: null,
        activeChannel: null,
        messages: null,
        cursor: null,
        hasMore: null,
        cache: {
          channels: state.channels,
          activeChannel: state.activeChannel,
          messages: state.messages,
          cursor: state.cursor,
          hasMore: state.hasMore,
        },
      };
    case "USE_CACHE":
      return {
        ...state,
        channels: state.cache.channels,
        activeChannel: state.cache.activeChannel,
        messages: state.cache.messages,
        cursor: state.cache.cursor,
        hasMore: state.cache.hasMore,
        cache: null,
      };
    default:
      return state;
  }
};

export const ChannelsContext = createContext(initialState);

export const ChannelsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(channelsReducer, initialState);
  // const authDispatch = useAuth("dispatch");
  // const profileId = useAuth("id");
  // const user = useAuth("user");

  const value = { ...state, dispatch };

  useEffect(() => {
    localStorage.setItem("channels", JSON.stringify(state.channels));
  }, [state.channels]);

  useEffect(() => {
    localStorage.setItem("activeChannel", JSON.stringify(state.activeChannel));
  }, [state.activeChannel]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(state.messages));
  }, [state.messages]);

  useEffect(() => {
    localStorage.setItem("cursor", JSON.stringify(state.cursor));
  }, [state.cursor]);

  useEffect(() => {
    localStorage.setItem("hasMore", JSON.stringify(state.hasMore));
  }, [state.hasMore]);

  useEffect(() => {
    localStorage.setItem("cache", JSON.stringify(state.cache));
  }, [state.cache]);

  return (
    <ChannelsContext.Provider value={value}>
      {children}
    </ChannelsContext.Provider>
  );
};
