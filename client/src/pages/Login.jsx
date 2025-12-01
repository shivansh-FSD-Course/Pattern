import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

const GLYPHS = ["φ", "π", "∑", "∞", "ψ", "∂", "√", "≡", "∫", "λ"];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // redirect target after login
  const redirectTo = location.state?.from || "/myspace";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [trails, setTrails] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [mounted, setMounted] = useState(false);

  /* Mount animation trigger */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* Scroll handler for parallax */
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  /* Reset error on input change */
  useEffect(() => {
    if (errorMsg) setErrorMsg("");
  }, [email, password]);

  /* Floaty math glyph decorator with parallax */
  const decor = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        left: Math.random() * 95,
        top: Math.random() * 95,
        size: 38 + Math.random() * 55,
        opacity: 0.1 + Math.random() * 0.035,
        rotate: Math.random() * 40 - 20,
        delay: i * 0.12,
        parallaxSpeed: 0.2 + Math.random() * 0.5,
      })),
    []
  );

  /* 
        RIPPLE EFFECT FOR BUTTON
   */
  const createRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  /* 
        LOGIN SUBMIT HANDLER
   */
  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res.data.success) {
        throw new Error(res.data.message || "Login failed");
      }

      localStorage.setItem("token", res.data.token);

      // fetch user object
      const userRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });

      localStorage.setItem("user", JSON.stringify(userRes.data.user));

      //  Redirect user to original target
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Server error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="relative w-full min-h-screen bg-paper text-ink flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* 
          CURSOR TRAIL
       */}
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

      {/* 
          FLOATING BACKGROUND DECORATION WITH PARALLAX
       */}
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
              '--rotate': `${g.rotate}deg`,
              '--delay': `${g.delay}s`,
              transform: `translateY(${scrollY * g.parallaxSpeed * 0.3}px) rotate(${g.rotate}deg)`,
            }}
          >
            {g.char}
          </span>
        ))}
      </div>

      {/* 
          LOGIN CARD DESIGN WITH FADE-IN
       */}
      <div
        className={`
          relative z-10 w-[380px]
          bg-white/60 backdrop-blur-md rounded-sm border border-ink/15
          p-10 shadow-[0_8px_28px_rgba(0,0,0,0.06)]
          transition-all duration-700
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* TITLE */}
        <h1 className="font-serif text-[32px] mb-2 text-center">
          Welcome Back
        </h1>

        <p className="text-center text-[13px] opacity-70 mb-8 font-serif">
          Sign in to continue your discovery.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">

          {/* EMAIL INPUT WITH FLOATING LABEL */}
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full border border-ink/30 rounded-sm px-4 pt-5 pb-2 bg-white/70
                focus:border-accent-green focus:ring-1 focus:ring-accent-green/30
                text-sm outline-none transition-all peer
              "
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="
                absolute left-4 top-3.5 text-sm text-ink/60
                transition-all duration-200 pointer-events-none
                peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent-green
                peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs
              "
            >
              Email
            </label>
          </div>

          {/* PASSWORD INPUT WITH FLOATING LABEL & TOGGLE */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full border border-ink/30 rounded-sm px-4 pt-5 pb-2 bg-white/70
                focus:border-accent-green focus:ring-1 focus:ring-accent-green/30
                text-sm outline-none transition-all peer pr-12
              "
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="
                absolute left-4 top-3.5 text-sm text-ink/60
                transition-all duration-200 pointer-events-none
                peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent-green
                peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs
              "
            >
              Password
            </label>
            
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

          {errorMsg && (
            <p className="text-[#c44444] text-[13px] text-center animate-shake">
              {errorMsg}
            </p>
          )}

          {/* BUTTON WITH RIPPLE EFFECT */}
          <button
            type="submit"
            disabled={loading}
            onClick={createRipple}
            className="
              relative overflow-hidden
              w-full px-4 py-2 mt-2
              border border-ink rounded-sm tracking-wide text-sm
              hover:bg-ink hover:text-paper transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <span className="relative z-10">
              {loading ? "Signing in…" : "Login"}
            </span>
            
            {/* RIPPLES */}
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full animate-ripple"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: ripple.size,
                  height: ripple.size,
                }}
              />
            ))}
          </button>
        </form>

        <p className="text-[13px] text-center mt-5 opacity-70">
          New here?{" "}
          <span
            className="underline cursor-pointer hover:text-accent-green transition-colors"
            onClick={() => navigate("/register")}
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
}

/*
      EYE ICONS FOR PASSWORD TOGGLE
*/
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