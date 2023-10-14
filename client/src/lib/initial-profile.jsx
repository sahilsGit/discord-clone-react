import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/authContext.jsx"; // Import your AuthContext

const InitialProfile = () => {
  const { user } = useContext(AuthContext);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (user) {
      // If the user is authenticated, fetch additional user data
      fetch("your-api-endpoint-for-user-data", {
        method: "GET",
        headers: {
          credentials: "include", // Include the JWT token for authentication
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Update the user's name in the state
          setUserName(data.name);
        })
        .catch((error) => {
          // Handle any errors
          console.error("Error fetching user data: ", error);
        });
    }
  }, [user]);

  return (
    <div>
      <h1>Welcome to the Homepage</h1>
      {user ? (
        <div>
          <p>Hello, {userName}!</p> {/* Access the user's email from context */}
          {/* Add other content for the logged-in user */}
        </div>
      ) : (
        <p>Please log in to access this page.</p>
      )}
    </div>
  );
};

export default InitialProfile;
