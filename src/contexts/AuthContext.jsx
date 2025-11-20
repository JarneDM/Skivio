import React, { createContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return !!localStorage.getItem("skivio_user");
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("skivio_user")) || { email: "", username: "" };
    } catch {
      return { email: "", username: "" };
    }
  });

  useEffect(() => {
    try {
      if (isLoggedIn && user && Object.keys(user).length) {
        localStorage.setItem("skivio_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("skivio_user");
      }
    } catch (err) {
      console.warn("AuthContext: localStorage unavailable", err);
    }
  }, [isLoggedIn, user]);

  const login = (userObj) => {
    setUser(userObj);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser({ email: "", username: "" });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("skivio_user");
    setIsLoggedIn(false);
  };

  return <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, login, logout }}>{children}</AuthContext.Provider>;
}

export default AuthContext;
