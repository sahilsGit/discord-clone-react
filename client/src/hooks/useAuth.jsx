import { useContext } from "react";
import { AuthContext } from "@/context/Auth-Context";

const useAuth = (value) => {
  switch (value) {
    case "error":
      return useContext(AuthContext).error;
    case "loading":
      return useContext(AuthContext).loading;
    case "user":
      return useContext(AuthContext).user;
    case "token":
      return useContext(AuthContext).access_token;
    case "id":
      return useContext(AuthContext).profileId;
    case "name":
      return useContext(AuthContext).name;
    case "image":
      return useContext(AuthContext).image;
    case "dispatch":
      return useContext(AuthContext).dispatch;
    default:
      return useContext(AuthContext).access_token;
  }
};

export default useAuth;
