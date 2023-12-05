import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "@/context/Auth-Context.jsx";
import { ServerContextProvider } from "@/context/Servers-Context.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthContextProvider>
        <ServerContextProvider>
          <App />
        </ServerContextProvider>
      </AuthContextProvider>
    </React.StrictMode>
  </BrowserRouter>
);
