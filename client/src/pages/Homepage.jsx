import { AuthContext } from "@/context/authContext";
import InitialProfile from "@/lib/initial-profile";
import { React, useContext } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom for navigation

const Homepage = () => {
  const { user } = useContext(AuthContext);
  return (
    <>
      <h1>Homepage</h1>
      {user ? (
        <InitialProfile />
      ) : (
        <div>
          <p>Please log in or register to access this page.</p>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </>
  );
};

export default Homepage;
