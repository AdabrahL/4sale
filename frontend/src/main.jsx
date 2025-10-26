import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import '@fortawesome/fontawesome-free/css/all.min.css';

import { AuthProvider } from "./contexts/AuthContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>   {/* 🚨 AuthProvider used but not imported */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
