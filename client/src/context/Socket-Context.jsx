import useAuth from "@/hooks/useAuth";
import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Function to establish a socket connection with authorization token
const getSocket = (access_token) => {
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
  hasError: false,
});

// SocketProvider component to manage the socket instance and provide it through context
const SocketContextProvider = ({ children }) => {
  // State to store the socket instance
  const access_token = useAuth("token");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  // const [hasError, setHasError] = useState(false);

  // Set up the socket connection when the component mounts
  useEffect(() => {
    const socketInstance = getSocket(access_token);
    setSocket(socketInstance);

    // if (hasError) {
    //   socket?.disconnect();
    //   setHasError(false);
    // }

    // socketInstance.on("socketError", () => {
    //   setHasError(true);
    // });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      // setTimeout(() => setHasError(true), 1000);
    });

    return () => {
      socket?.disconnect();
    };
  }, [
    access_token,
    // hasError
  ]);

  return (
    // Provide the socket instance through context to its children
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        // hasError
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContextProvider, SocketContext };
