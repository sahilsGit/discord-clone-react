import { createContext, useEffect, useReducer } from "react";

// Define the initial state for the authentication context
const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null, // Check for a previously authenticated user in local storage
  loading: false, // Indicate if authentication actions are in progress
  error: null, // Store any authentication-related errors
};

// Create an AuthContext to provide authentication state to the rest of the application
export const AuthContext = createContext(INITIAL_STATE);

// Reducer function for managing authentication state
const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null, // Clear the user on login start
        loading: true, // Set loading to true
        error: null, // Clear any previous errors
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload, // Set the authenticated user
        loading: false, // Set loading to false
        error: null, // Clear any previous errors
      };
    case "LOGIN_FAILURE":
      return {
        user: null, // Clear the user on login failure
        loading: false, // Set loading to false
        error: action.payload, // Set the error message
      };
    case "LOGOUT":
      return {
        user: null, // Clear the user on logout
        loading: false, // Set loading to false
        error: null, // Clear any previous errors
      };
    default:
      return state;
  }
};

// AuthContextProvider component to wrap the application and provide authentication context
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  // Store the user in local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
