import useAuth from "@/hooks/useAuth";
import InitialProfile from "@/lib/initial-profile";
import { React } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom for navigation

const Homepage = () => {
  const user = useAuth("user");
  const access_token = useAuth("token");

  return (
    <>
      {!user || !access_token ? (
        <div>
          <p>Please log in or register to access this page.</p>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      ) : (
        <InitialProfile />
      )}
    </>
  );
};

export default Homepage;
