import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user on app load
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await API.get("/user");
        setUser(data.user || data); // handle both formats
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // Register
  const register = async (payload) => {
    const { data } = await API.post("/register", payload);
    localStorage.setItem("AUTH_TOKEN", data.token);
    setUser(data.user);
    return data;
  };

  // Login
  const login = async (payload) => {
    const { data } = await API.post("/login", payload);
    localStorage.setItem("AUTH_TOKEN", data.token);
    setUser(data.user);
    return data;
  };

  // Logout
  const logout = async () => {
    try {
      await API.post("/logout");
    } catch (err) {
      console.error("Logout failed", err);
    }
    localStorage.removeItem("AUTH_TOKEN");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};