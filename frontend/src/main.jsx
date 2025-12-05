import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// in src/main.jsx (top)
import "bootstrap/dist/css/bootstrap-grid.min.css"; // Bootstrap grid only
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import App from "./App";
import "./index.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
