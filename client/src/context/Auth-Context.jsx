import { createContext, useEffect, useReducer } from "react";

// Define the initial state for the authentication context
const INITIAL_STATE = {
  access_token: JSON.parse(localStorage.getItem("access_token")) || null,
  user: JSON.parse(localStorage.getItem("user")) || null, // Check for a previously authenticated user in local storage
  name: null,
  profileId: null,
  image: null,
  loading: false, // Indicate if authentication actions are in progress
  error: null, // Store any authentication-related errors
};

// Create an AuthContext to provide authentication state to the rest of the application
const AuthContext = createContext(INITIAL_STATE);

// Reducer function for managing authentication state
const AuthReducer = (state, action) => {
  // console.log("RECIEVED AUTH DISPATCH: ", action);
  switch (action.type) {
    case "RESET_STATE":
      return {
        access_token: null,
        user: null, // Clear the user on login start
        name: null,
        image: null,
        profileId: null,
        loading: false, // Set loading to true
        error: null, // Clear any previous errors
      };
    case "LOGIN_START":
      return {
        access_token: null,
        user: null, // Clear the user on login start
        name: null,
        image: null,
        profileId: null,
        loading: true, // Set loading to true
        error: null, // Clear any previous errors
      };
    case "LOGIN_FAILURE":
      return {
        access_token: null,
        user: null, // Clear the user on login failure
        name: null,
        image: null,
        profileId: null,
        loading: false, // Set loading to false
        error: action.payload, // Set the error message
      };
    case "TOKEN_RECEIVED":
      return {
        access_token: action.payload.access_token,
        user: action.payload.user,
        profileId: action.payload.profileId,
        name: action.payload.name,
        image: action.payload.image,
        loading: false,
        error: null,
      };
    case "LOGOUT":
      return {
        access_token: null,
        user: null, // Clear the user on logout
        profileId: null,
        name: null,
        image: null,
        loading: false, // Set loading to false
        error: null, // Clear any previous errors
      };
    default:
      return state;
  }
};

// AuthContextProvider component to wrap the application and provide authentication context
const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  // Store the user in local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("access_token", JSON.stringify(state.access_token));
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.access_token, state.user]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };
