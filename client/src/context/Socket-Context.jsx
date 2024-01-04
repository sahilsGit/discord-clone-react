import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Function to establish a socket connection with authorization token
const getSocket = () => {
  const access_token = JSON.parse(localStorage.getItem("access_token")); // Retrieve jwt token from local storage or cookie

  // Create a socket connection with the provided URI and authentication
  return io(import.meta.env.VITE_API_SOCKET_URI, {
    withCredentials: true,
    auth: {
      access_token,
    },
    extraHeaders: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

// Create a context to hold the socket instance
const SocketContext = createContext({
  socket: null,
  isConnected: false,
});

// SocketProvider component to manage the socket instance and provide it through context
const SocketContextProvider = ({ children }) => {
  // State to store the socket instance
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Set up the socket connection when the component mounts
  useEffect(() => {
    const socketInstance = getSocket();

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socket && socket.disconnect();
    };
  }, []);

  return (
    // Provide the socket instance through context to its children
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContextProvider, SocketContext };
