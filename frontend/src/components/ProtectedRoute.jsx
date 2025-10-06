// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-10">Checking authentication...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
