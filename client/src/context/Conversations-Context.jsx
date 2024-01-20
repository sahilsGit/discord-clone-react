import React, { createContext, useEffect, useReducer } from "react";

const initialState = {
  conversations: null,
  activeConversation: null,
};

const conversationsReducer = (state, action) => {
  console.log("REC CON. DISP.", action);
  switch (action.type) {
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload };
    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversation: action.payload };
    default:
      return state;
  }
};

export const ConversationsContext = createContext(initialState);

export const ConversationsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(conversationsReducer, initialState);

  const value = {
    ...state,
    dispatch,
  };

  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(state.conversations));
  }, [state.conversations]);

  useEffect(() => {
    localStorage.setItem(
      "activeConversation",
      JSON.stringify(state.activeConversation)
    );
  }, [state.activeConversation]);

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
};
