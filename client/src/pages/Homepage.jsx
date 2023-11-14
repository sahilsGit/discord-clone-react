import useAuth from "@/hooks/useAuth";
import InitialProfile from "@/lib/initial-profile";
import { useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom for navigation

const Homepage = () => {
  console.log("INSIDE HOMEPAGE");
  const user = useAuth("user");
  const access_token = useAuth("token");

  useEffect(() => {
    console.log("HOMEPAGE MOUNTED");
  }, []);

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
