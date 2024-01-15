import useAuth from "@/hooks/useAuth";
import { createContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";

const INITIAL_STATE = {
  allConversations: null,
  activeConversation: null,
  loading: false,
  error: null,
};

export const MiscContext = createContext(INITIAL_STATE);

const reducer = (state, action) => {
  console.log("RC", action);
  switch (action.type) {
    case "SET_CONVERSATIONS":
      return {
        ...state,
        allConversations: action.payload,
        loading: false,
      };
    case "SET_CUSTOM":
      return { ...state, ...action.payload };
    case "SET_ACTIVE_CONVERSATION":
      return {
        ...state,
        activeConversation: action.payload,
        loading: false,
      };
    case "RESET_STATE":
      return INITIAL_STATE;
    default:
      return state;
  }
};

export const MiscContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const navigate = useNavigate();
  const profileId = useAuth("id");

  useEffect(() => {
    localStorage.setItem(
      "allConversations",
      JSON.stringify(state.allConversations)
    );
  }, [state.allConversations]);

  useEffect(() => {
    localStorage.setItem(
      "activeConversation",
      JSON.stringify(state.activeConversation)
    );

    state.activeConversation &&
      navigate(
        `/@me/conversations/${state.activeConversation.profileId}/${profileId}`
      );
  }, [state.activeConversation]);

  return (
    <MiscContext.Provider value={{ ...state, dispatch }}>
      {children}
    </MiscContext.Provider>
  );
};
