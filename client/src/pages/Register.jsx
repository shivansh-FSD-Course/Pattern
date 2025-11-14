import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

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

      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      console.error(error);
      setErrorMsg("Server error.");
      setLoading(false);
    }
  };

  // scanline effect
  const scanStyle = {
    backgroundImage:
      "repeating-linear-gradient(rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 3px)",
  };

  return (
    <div
      className="
        relative flex justify-center items-center w-full h-screen bg-black 
        font-pixel overflow-hidden
        animate-[crtFlicker_0.2s_steps(2)_infinite]
      "
    >
      {/* SCANLINE LOADER */}
      {loading && (
        <div
          className="
            fixed inset-0 z-50 animate-[scanline_0.15s_linear_infinite] 
            backdrop-blur-[2px]
          "
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(0,255,0,0.2) 0px, rgba(0,255,0,0.15) 2px, rgba(0,255,0,0.05) 4px)",
          }}
        ></div>
      )}

      {/* CRT scanlines */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={scanStyle}
      ></div>

      {/* Floating symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {["π","σ","μ","Ω","∞","φ","ψ","Δ","ƒ","λ"].map((s, i) => (
          <span
            key={i}
            className="
              absolute text-[22px] text-[#7cff91] opacity-[0.12]
              animate-[regFloat_linear_infinite]
            "
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* REGISTER CARD */}
      <form
        onSubmit={handleSubmit}
        className="
          relative z-30 w-[360px]
          bg-[rgba(20,20,20,0.7)] p-9 
          border border-[#2aff2a]
          shadow-[0_0_18px_#41ff41,inset_0_0_25px_#093b09]
          animate-[fadeInUp_0.6s_ease-out]
          flex flex-col gap-4
        "
      >
        <h1
          className="
            text-center text-[26px] text-[#8aff8a] mb-4
            drop-shadow-[0_0_14px_#38ff38]
          "
        >
          CREATE ACCOUNT
        </h1>

        {/* ERROR */}
        {errorMsg && (
          <div
            className="
              bg-[rgba(255,0,0,0.18)] border border-[#ff3b3b]
              text-[#ff7a7a] p-2 text-center text-[13px] rounded
              shadow-[0_0_6px_#ff3b3b]
            "
          >
            {errorMsg}
          </div>
        )}

        {/* USERNAME */}
        <label className="text-[#cfcfcf] text-[13px]">Username</label>
        <input
          type="text"
          name="username"
          required
          autoComplete="off"
          value={form.username}
          onChange={handleChange}
          className="
            w-full bg-[#0d0d0d] text-[#c7ffc7] p-2 text-[14px]
            border border-[#3eff3e] outline-none transition
            focus:border-[#00ff00] focus:shadow-[0_0_12px_#1fff1f]
            font-pixel
          "
        />

        {/* EMAIL */}
        <label className="text-[#cfcfcf] text-[13px]">Email</label>
        <input
          type="email"
          name="email"
          required
          autoComplete="off"
          value={form.email}
          onChange={handleChange}
          className="
            w-full bg-[#0d0d0d] text-[#c7ffc7] p-2 text-[14px]
            border border-[#3eff3e] outline-none transition
            focus:border-[#00ff00] focus:shadow-[0_0_12px_#1fff1f]
            font-pixel
          "
        />

        {/* PASSWORD */}
        <label className="text-[#cfcfcf] text-[13px]">Password</label>
        <input
          type="password"
          name="password"
          required
          autoComplete="off"
          value={form.password}
          onChange={handleChange}
          className="
            w-full bg-[#0d0d0d] text-[#c7ffc7] p-2 text-[14px]
            border border-[#3eff3e] outline-none transition
            focus:border-[#00ff00] focus:shadow-[0_0_12px_#1fff1f]
            font-pixel
          "
        />

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 border-2 border-[#00ff00] text-[#00ff00]
            text-[15px] font-pixel transition
            hover:bg-[#00ff00] hover:text-black hover:shadow-[0_0_18px_#00ff00]
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          {loading ? "PLEASE WAIT..." : "REGISTER"}
        </button>

        {/* FOOTER SWITCH */}
        <p className="text-center text-[#cfcfcf] text-[13px] mt-2">
          Already have an account?{" "}
          <span
            className="text-[#8aff8a] underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
