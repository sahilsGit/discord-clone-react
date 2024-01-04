import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "@/context/Auth-Context.jsx";
import { ServerContextProvider } from "@/context/Servers-Context.jsx";
import ErrorBoundary from "./lib/error-boundry";
import { SocketContextProvider } from "./context/Socket-Context";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <React.StrictMode>
      <ErrorBoundary>
        <AuthContextProvider>
          <SocketContextProvider>
            <ServerContextProvider>
              <App />
            </ServerContextProvider>
          </SocketContextProvider>
        </AuthContextProvider>
      </ErrorBoundary>
    </React.StrictMode>
  </BrowserRouter>
);
