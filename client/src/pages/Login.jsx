import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const GLYPHS = ["φ", "π", "∑", "∞", "ψ", "∂", "√", "≡", "∫", "λ"];

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  /* ───────────────────────────────
      FLOATING BACKGROUND GLYPHS
  ─────────────────────────────── */
  const decor = useMemo(
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

  async function handleLogin(e) {
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

      setTimeout(() => navigate("/myspace"), 500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Server error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-paper text-ink flex items-center justify-center overflow-hidden">

      {/* ───────────────────────────────
          FLOATING BACKGROUND
      ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {decor.map((g, i) => (
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

      {/* ───────────────────────────────
          LOGIN CARD
      ─────────────────────────────── */}
      <div
        className="
          relative z-10 w-[380px]
          bg-white/60 backdrop-blur-md rounded-sm border border-ink/15
          p-10 shadow-[0_8px_28px_rgba(0,0,0,0.06)]
        "
      >
        {/* TITLE */}
        <h1 className="font-serif text-[32px] mb-2 text-center">
          Welcome Back
        </h1>

        <p className="text-center text-[13px] opacity-70 mb-8 font-serif">
          Sign in to continue your discovery.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              border border-ink/30 rounded-sm px-4 py-2 bg-white/70
              focus:border-ink text-sm outline-none transition
            "
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              border border-ink/30 rounded-sm px-4 py-2 bg-white/70
              focus:border-ink text-sm outline-none transition
            "
          />

          {errorMsg && (
            <p className="text-[#c44444] text-[13px] text-center">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full px-4 py-2 mt-2
              border border-ink rounded-sm tracking-wide text-sm
              hover:bg-ink hover:text-paper transition-all
              disabled:opacity-50
            "
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="text-[13px] text-center mt-5 opacity-70">
          New here?{" "}
          <span
            className="underline cursor-pointer hover:text-accent-green"
            onClick={() => navigate("/register")}
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
}
