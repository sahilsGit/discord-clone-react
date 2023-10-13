import React, { useState, useEffect } from "react";

const InitialProfile = () => {
  const [user, setUser] = useState(null);

  // Add code to check if the user is logged in and fetch user data if available.
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    };

    const token = getCookie("login_token");

    if (token) {
      // You can send a request to your server to verify the token and fetch user data.
      // You can use the token to make an authenticated API call to retrieve user information.
      // Example:
      // fetch('/api/getUserProfile', {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // })
      // .then(response => response.json())
      // .then(data => {
      //   setUser(data); // Set user data if the user is authenticated.
      // })
      // .catch(error => {
      //   console.error('Error fetching user data:', error);
      //   // Handle errors as needed.
      // });
    }
  }, []);

  return (
    <div>
      <h1>Welcome to the Homepage</h1>
      {user ? (
        <div>
          <p>Hello, {user.username}!</p>
          {/* Add other content for the logged-in user */}
        </div>
      ) : (
        <p>Please log in to access this page.</p>
      )}
    </div>
  );
};

export default InitialProfile;
