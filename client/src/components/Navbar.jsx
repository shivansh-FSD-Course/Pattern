// src/components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  const goHome = () => navigate("/home");

  const goMySpace = () => {
    if (token) navigate("/myspace");
    else
      navigate("/login", {
        state: { from: "/myspace", mustRegister: true },
      });
  };

  const goCommunity = () => {
    if (token) navigate("/community");
    else
      navigate("/login", {
        state: { from: "/community", mustRegister: true },
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const goLogin = () => navigate("/login");

  return (
    <header className="absolute top-0 left-0 w-full px-10 py-6 flex justify-between items-center z-50">

      {/* LOGO  always goes home */}
      <button
        onClick={goHome}
        className="
          text-2xl font-semibold tracking-wide
          text-transparent bg-clip-text
          bg-gradient-to-r from-yellow-300 to-orange-500
        "
      >
        PATTERNCRAFT
      </button>

      {/* RIGHT NAV */}
      <nav className="flex gap-8 text-lg">

        {/*  USERNAME when logged in, otherwise “My Space” */}
        <button
          onClick={goMySpace}
          className="hover:text-cyan-300 transition"
        >
          {token && user?.username ? `@${user.username}` : "My Space"}
        </button>

        {/*  CONDITIONAL LOGIN / LOGOUT */}
        {!token ? (
          <button onClick={goLogin} className="hover:text-cyan-300 transition">
            Login
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="hover:text-red-300 transition"
          >
            Logout
          </button>
        )}

        <button
          onClick={goCommunity}
          className="hover:text-cyan-300 transition"
        >
          Community
        </button>
      </nav>
    </header>
  );
}
