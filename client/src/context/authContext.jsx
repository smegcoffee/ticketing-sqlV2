import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "@/api/axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const USERINFO_URL = "/login";
const CHECK_COOKIE_URL = "/auth/check-cookie";

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState();
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    const handleSuccessfulLogin = (token) => {
      setIsAuthenticated(true);
      sessionStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
      if (decoded.requesting_password === true) {
        navigate("/auth/setup-new-password");
      } else {
        navigate("/dashboard/ticket");
      }
    };

    const checkCookies = async () => {
      try {
        const response = await axios.get(CHECK_COOKIE_URL);

        if (response.status === 200) {
          if (storedToken) {
            const decoded = jwtDecode(storedToken);
            handleSuccessfulLogin(storedToken);
          } else {
            setIsAuthenticated(false);
            clearStorage();
          }
        } else {
          clearStorage();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking cookies:", error);
        clearStorage();
        setIsAuthenticated(false);
      }
    };

    const clearStorage = () => {
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
    };

    checkCookies();
  }, [isAuthenticated]);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await axios.post(USERINFO_URL, {
        usernameOrEmail,
        password,
      });

      if (response.status === 200) {
        setIsAuthenticated(true);
        sessionStorage.setItem("token", response.data.access_token);
        localStorage.setItem("token", response.data.access_token);
        navigate("/dashboard/home");
        const decoded = jwtDecode(response.data.access_token);
        setUserRole(decoded.role);
        return { success: true };
      } else {
        setIsAuthenticated(false);
        return { error: "Invalid credentials" };
      }
    } catch (error) {
      setIsAuthenticated(false);
      return { error: "An error occurred during logins" };
    }
  };

  const logout = async () => {
    try {
      const response = await axios.get("/logout");
      if (response.status === 200) {
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");

        setIsAuthenticated(false);
      } else {
        console.error("Logout failed. Status code:", response.status);
      }
    } catch (error) {
      console.error("An error occurred while logging out:", error);
    }
  };

  const contextValue = {
    isAuthenticated,
    userRole,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
