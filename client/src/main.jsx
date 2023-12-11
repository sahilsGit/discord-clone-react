import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "@/context/Auth-Context.jsx";
import { ServerContextProvider } from "@/context/Servers-Context.jsx";
import ErrorBoundary from "./lib/error-boundry";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <React.StrictMode>
      <ErrorBoundary>
        <AuthContextProvider>
          <ServerContextProvider>
            <App />
          </ServerContextProvider>
        </AuthContextProvider>
      </ErrorBoundary>
    </React.StrictMode>
  </BrowserRouter>
);
