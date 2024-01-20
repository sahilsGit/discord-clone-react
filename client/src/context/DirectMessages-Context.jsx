import { createContext, useEffect, useReducer } from "react";

const INITIAL_STATE = {
  messages: null,
  cursor: null,
  hasMore: false,
};

const DirectMessagesReducer = (state, action) => {
  console.log("messages", action);
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const DirectMessagesContext = createContext();

// Messages provider using useReducer
const DirectMessagesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(DirectMessagesReducer, INITIAL_STATE);

  const value = { ...state, dispatch };

  useEffect(() => {
    localStorage.setItem("directMessages", JSON.stringify(state.messages));
  }, [state.messages]);

  return (
    <DirectMessagesContext.Provider value={value}>
      {children}
    </DirectMessagesContext.Provider>
  );
};

export { DirectMessagesContextProvider, DirectMessagesContext };
