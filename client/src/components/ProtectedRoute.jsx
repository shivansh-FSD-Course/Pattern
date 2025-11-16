// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // Graceful logout if token is invalid/expired
  const handleInvalidToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Validate token (JWT is base64 encoded)
  const isTokenValid = () => {
    if (!token) return false;

    try {
      const [, payload] = token.split(".");
      const decoded = JSON.parse(atob(payload)); // base64 decode
      return decoded.exp * 1000 > Date.now(); // Not expired
    } catch (err) {
      return false;
    }
  };

  // If token missing or invalid, logout and redirect
  if (!token || !isTokenValid()) {
    handleInvalidToken();
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          mustRegister: false,
          message: "Your session expired. Please log in again.",
        }}
      />
    );
  }

  return children;
}
