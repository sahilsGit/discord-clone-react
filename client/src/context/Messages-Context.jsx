import { createContext, useEffect, useReducer } from "react";

const INITIAL_STATE = {
  messages: null,
  cursor: null,
  hasMore: false,
};

const messagesReducer = (state, action) => {
  console.log("messages", action);
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const MessagesContext = createContext();

// Messages provider using useReducer
const MessagesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messagesReducer, INITIAL_STATE);

  const value = { ...state, dispatch };

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(state.messages));
  }, [state.messages]);

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};

export { MessagesContextProvider, MessagesContext };
