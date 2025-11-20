import React, { createContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return !!localStorage.getItem("boardly_user");
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("boardly_user")) || { email: "", username: "" };
    } catch {
      return { email: "", username: "" };
    }
  });

  useEffect(() => {
    try {
      if (isLoggedIn && user && Object.keys(user).length) {
        localStorage.setItem("boardly_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("boardly_user");
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
    setIsLoggedIn(false);
  };

  return <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, login, logout }}>{children}</AuthContext.Provider>;
}

export default AuthContext;
