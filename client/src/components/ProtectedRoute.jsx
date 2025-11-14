import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // If there's NO token, force login and tell it where we came from
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, mustRegister: true }}
      />
    );
  }

  // If token exists, render the protected page
  return children;
}
