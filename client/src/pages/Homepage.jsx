import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom for navigation

const Homepage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuth("user");
  const access_token = useAuth("token");

  console.log("inside homepage");

  useEffect(() => {
    if (user && access_token) {
      console.log("navigating");
      navigate("/@me");
    }
    setLoading(false);
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        <p>Please log in or register to access this page.</p>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </>
  );
};

export default Homepage;
