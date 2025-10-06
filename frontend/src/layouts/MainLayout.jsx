// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* main content area — Outlet renders the nested routes */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
