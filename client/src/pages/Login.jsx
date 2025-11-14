import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

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
      const res = await api.post("/auth/login", { email, password });

      if (!res.data.success) {
        setErrorMsg(res.data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);

      const userRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });

      localStorage.setItem("user", JSON.stringify(userRes.data.user));

      setTimeout(() => navigate("/myspace"), 800);
    } catch (err) {
      console.error(err);
      setErrorMsg("Server error. Try again.");
      setLoading(false);
    }
  };

  // CRT scanlines style
  const scanStyle = {
    backgroundImage:
      "repeating-linear-gradient(rgba(255,255,255,0.035), rgba(255,255,255,0.035) 2px, transparent 3px, transparent 6px)",
  };

  return (
    <div
      className="
        relative w-full h-screen bg-black flex flex-col justify-center items-center
        text-[#e6e6d5] font-pixel overflow-hidden
        animate-[crtFlicker_0.2s_steps(2)_infinite]
      "
    >

      {/* ─────────────────────────────── */}
      {/* SCANLINE LOADER */}
      {/* ─────────────────────────────── */}
      {loading && (
        <div
          className="
            fixed inset-0 z-50 
            animate-[scanline_0.15s_linear_infinite]
            backdrop-blur-[2px]
          "
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(0,255,0,0.2) 0px, rgba(0,255,0,0.15) 2px, rgba(0,255,0,0.05) 4px)",
          }}
        ></div>
      )}

      {/* CRT overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={scanStyle}
      ></div>

      {/* TITLE */}
      <h1
        className="
          text-[26px] text-[#9aff9a] mb-8 z-20
          drop-shadow-[0_0_12px_#9aff9a,0_0_22px_#57ff57]
        "
      >
        WELCOME BACK!
      </h1>

      {/* LOGIN BOX */}
      <form
        onSubmit={handleLogin}
        className="
          z-20 bg-[rgba(20,20,20,0.8)] border-2 border-neonGreen
          p-10 rounded w-[320px] flex flex-col gap-5
        "
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            px-3 py-2 bg-[#0a0a0a] border-2 border-[#444]
            text-neonGreen text-[12px] outline-none transition
            font-pixel
            focus:border-neonGreen
          "
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            px-3 py-2 bg-[#0a0a0a] border-2 border-[#444]
            text-neonGreen text-[12px] outline-none transition
            font-pixel
            focus:border-neonGreen
          "
        />

        {errorMsg && (
          <p className="text-[#ff6b6b] text-[12px] text-center">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="
            px-3 py-2 border-2 border-neonGreen text-neonGreen 
            text-[14px] font-pixel transition
            hover:bg-neonGreen hover:text-black
          "
        >
          LOGIN
        </button>

        <p className="text-[10px] text-center text-gray-400">
          New here?{" "}
          <span
            className="text-neonGreen cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Create an account
          </span>
        </p>
      </form>
    </div>
  );
}
