import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";         // <-- Axios instance
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Login request
      const res = await api.post("/auth/login", { email, password });

      if (!res.data.success) {
        setErrorMsg(res.data.message || "Login failed");
        setLoading(false);
        return;
      }

      // 2. Store token
      localStorage.setItem("token", res.data.token);

      // 3. Fetch user profile
      const userRes = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${res.data.token}`,
        },
      });

      // 4. Save user to localStorage
      localStorage.setItem("user", JSON.stringify(userRes.data.user));

      // Small delay for the scanline animation
      setTimeout(() => {
        navigate("/myspace");
      }, 800);

    } catch (err) {
      console.error(err);
      setErrorMsg("Server error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* SCANLINE LOADING OVERLAY */}
      {loading && <div className="scanline-loader"></div>}

      <div className="crt-overlay"></div>

      <h1 className="login-title">WELCOME BACK!</h1>

      <form className="login-box" onSubmit={handleLogin}>
        
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMsg && <p className="login-error">{errorMsg}</p>}

        <button type="submit" className="login-btn">
          LOGIN
        </button>

        <p className="login-switch">
          New here?{" "}
          <span onClick={() => navigate("/register")}>Create an account</span>
        </p>
      </form>
    </div>
  );
}
