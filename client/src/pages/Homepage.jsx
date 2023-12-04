// Imports
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

/*
 * Homepage
 *
 * This component serves as the landing page.
 * It checks the user's authentication status.
 * Redirects authenticated users to their profile page (/@me).
 * The unauthenticated ones can either login or register.
 */

const Homepage = () => {
  // console.log("HOMEPAGE MOUNTED");
  const navigate = useNavigate(); // For programmatic navigation
  const location = useLocation();
  const from = location.state?.from?.pathname || "/@me";

  // Fetch user and access token from custom auth hook
  const user = useAuth("user");
  const access_token = useAuth("token");

  // Navigate the authenticated user to their profile pages
  useEffect(() => {
    // console.log("from", from);
    if (user && access_token) {
      navigate(from);
    }
  }, [user, access_token]);

  return (
    <div>
      {user && access_token ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Please log in or register to access this page.</p>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </div>
  );
};

export default Homepage;
