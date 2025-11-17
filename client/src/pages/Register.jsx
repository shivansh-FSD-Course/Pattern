// src/pages/Register.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const GLYPHS = ["φ", "π", "∑", "∞", "ψ", "∂", "√", "≡", "∫", "λ"];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [trails, setTrails] = useState([]);

  const isPasswordValid =
    form.password.length >= 10 && /[^A-Za-z0-9]/.test(form.password);

  /* Cursor trail handler */
  const handleMouseMove = (e) => {
    const newTrail = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    };
    
    setTrails(prev => [...prev.slice(-15), newTrail]);
  };

  /* Clear errors on form change */
  useEffect(() => {
    if (errorMsg) setErrorMsg("");
  }, [form]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);

      if (!res.data.success) {
        throw new Error(res.data.message || "Registration failed");
      }

      setTimeout(() => navigate("/login"), 500);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  /* Background Glyph Effects */
  const glyphs = useMemo(
    () =>
      Array.from({ length: 26 }).map(() => ({
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        left: Math.random() * 95,
        top: Math.random() * 95,
        size: 38 + Math.random() * 55,
        opacity: 0.015 + Math.random() * 0.035,
        rotate: Math.random() * 40 - 20,
      })),
    []
  );

  return (
    <div 
      className="relative w-full min-h-screen bg-paper text-ink flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* CURSOR TRAIL */}
      {trails.map(trail => (
        <span
          key={trail.id}
          className="fixed pointer-events-none text-accent-green/30 text-sm animate-trail-fade z-50"
          style={{ 
            left: trail.x - 10, 
            top: trail.y - 10,
            fontFamily: 'serif',
          }}
        >
          {trail.char}
        </span>
      ))}

      {/* FLOATING BACKGROUND GLYPHS */}
      <div className="absolute inset-0 pointer-events-none">
        {glyphs.map((g, i) => (
          <span
            key={i}
            className="absolute font-serif math-float"
            style={{
              left: `${g.left}%`,
              top: `${g.top}%`,
              opacity: g.opacity,
              fontSize: `${g.size}px`,
              transform: `rotate(${g.rotate}deg)`,
            }}
          >
            {g.char}
          </span>
        ))}
      </div>

      {/* REGISTER CARD */}
      <form
        onSubmit={handleSubmit}
        className="
          relative z-10 w-[380px]
          bg-white/60 backdrop-blur-md border border-ink/15 rounded-sm
          shadow-[0_8px_28px_rgba(0,0,0,0.06)]
          p-10 flex flex-col gap-5
        "
      >
        <h1 className="font-serif text-[32px] mb-2 text-center">
          Create Account
        </h1>

        <p className="text-[13px] opacity-70 text-center font-serif mb-3">
          Join PatternCraft and begin your discovery.
        </p>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="text-center text-[13px] text-[#b24444] bg-[#ffdad6] py-2 rounded">
            {errorMsg}
          </div>
        )}

        {/* USERNAME INPUT */}
        <label className="text-[13px] opacity-75">Username</label>
        <input
          type="text"
          name="username"
          required
          value={form.username}
          onChange={handleChange}
          className="
            border border-ink/30 rounded-sm px-3 py-2 bg-white/70
            focus:border-ink outline-none text-sm transition
          "
        />

        {/* EMAIL INPUT */}
        <label className="text-[13px] opacity-75">Email</label>
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
          className="
            border border-ink/30 rounded-sm px-3 py-2 bg-white/70
            focus:border-ink outline-none text-sm transition
          "
        />

        {/* PASSWORD INPUT WITH TOGGLE */}
        <label className="text-[13px] opacity-75">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="
              w-full border border-ink/30 rounded-sm px-3 py-2 bg-white/70
              focus:border-ink outline-none text-sm transition pr-10
            "
          />
          
          {/* PASSWORD TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              text-ink/40 hover:text-ink/70 transition-colors
            "
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {/* PASSWORD RULES */}
        {!isPasswordValid && form.password.length > 0 && (
          <p className="text-red-500 text-xs">
            Password must be at least 10 characters and include a special
            character.
          </p>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading || !isPasswordValid}
          className="
            mt-3 w-full border border-ink rounded-sm px-4 py-2 text-sm tracking-wide
            hover:bg-ink hover:text-paper transition disabled:opacity-40
          "
        >
          {loading ? "Please wait…" : "Register"}
        </button>

        <p className="text-center text-[13px] opacity-75 mt-1">
          Already have an account?{" "}
          <span
            className="underline cursor-pointer hover:text-accent-green"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

/* ───────────────────────────────
      EYE ICONS FOR PASSWORD TOGGLE
────────────────────────────── */
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);