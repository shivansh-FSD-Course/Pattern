import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);

      if (!res.data.success) {
        setErrorMsg(res.data.message || "Registration failed");
        setLoading(false);
        return;
      }

      // After successful registration → go to login
      setTimeout(() => {
        navigate("/login");
      }, 800);

    } catch (error) {
      console.error(error);
      setErrorMsg("Server error.");
      setLoading(false);
    }
  };

  return (
    <div className="reg-container">
      
      {/* SCANLINE LOADER */}
      {loading && <div className="scanline-loader"></div>}
      <div className="crt-overlay"></div>

      {/* Floating math symbols */}
      <div className="reg-symbol-layer">
        {["π","σ","μ","Ω","∞","φ","ψ","Δ","ƒ","λ"].map((s,i)=>(
          <span 
            key={i}
            className="reg-symbol"
            style={{
              left: `${Math.random()*100}%`,
              top: `${Math.random()*100}%`,
              animationDelay: `${Math.random()*5}s`,
              animationDuration: `${6 + Math.random()*6}s`
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <form className="reg-box" onSubmit={handleSubmit}>
        <h1 className="reg-title">CREATE ACCOUNT</h1>

        {errorMsg && <div className="reg-error">{errorMsg}</div>}

        <label className="reg-label">Username</label>
        <input
          type="text"
          name="username"
          className="reg-input"
          required
          autoComplete="off"
          value={form.username}
          onChange={handleChange}
        />

        <label className="reg-label">Email</label>
        <input
          type="email"
          name="email"
          className="reg-input"
          required
          autoComplete="off"
          value={form.email}
          onChange={handleChange}
        />

        <label className="reg-label">Password</label>
        <input
          type="password"
          name="password"
          className="reg-input"
          required
          autoComplete="off"
          value={form.password}
          onChange={handleChange}
        />

        <button className="reg-btn" type="submit" disabled={loading}>
          {loading ? "PLEASE WAIT..." : "REGISTER"}
        </button>

        <p className="reg-footer">
          Already have an account?{" "}
          <span className="reg-link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
