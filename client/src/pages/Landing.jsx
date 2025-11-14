import React from "react";
import { useNavigate } from "react-router-dom";

const GLYPHS = ["π","φ","∞","Σ","∫","ψ","λ","Ω","μ","θ","τ","β"];

export default function Landing() {
  const navigate = useNavigate();

  const goToCommunity = () => navigate("/community");  // ProtectedRoute handles auth

  return (
    <div className="relative w-full h-screen bg-[#03040a] overflow-hidden text-white">

      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,60,120,0.4),#03040a_70%)]"></div>

      {/* STARFIELD */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {Array.from({ length: 140 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-[2px] h-[2px] bg-white rounded-full opacity-30 animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2.2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* ORBITS + GLYPHS (Right side) */}
      <div className="absolute right-[-8%] top-[10%] w-[700px] h-[700px] opacity-70 pointer-events-none">

        {/* OUTER ORBIT */}
        <svg className="absolute inset-0 animate-spinSlow" viewBox="0 0 600 600">
          <circle
            cx="300"
            cy="300"
            r="250"
            stroke="rgba(0,200,255,0.45)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="18 36"
          />
        </svg>

        {/* INNER ORBIT */}
        <svg className="absolute inset-0 animate-spinReverse" viewBox="0 0 600 600">
          <circle
            cx="300"
            cy="300"
            r="170"
            stroke="rgba(255,160,240,0.45)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="14 28"
          />
        </svg>

        {/* GLYPHS FLOATING AROUND ORBITS */}
        {GLYPHS.map((g, i) => {
          const angle = (i / GLYPHS.length) * 2 * Math.PI;
          const radius = 210;

          return (
            <span
              key={i}
              className="
                absolute text-[22px] text-cyan-300 
                opacity-80 drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]
                animate-glyphFloat
              "
              style={{
                left: `${300 + radius * Math.cos(angle)}px`,
                top: `${300 + radius * Math.sin(angle)}px`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {g}
            </span>
          );
        })}
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-20 h-full flex flex-col justify-center pl-[10%] max-w-xl">

        <h1
          className="
            text-6xl font-bold leading-tight mb-4
            text-transparent bg-clip-text
            bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300
          "
        >
          Uncover the <br /> Patterns
        </h1>

        <p className="mt-4 text-lg text-gray-300 leading-relaxed">
          Transform raw data into mesmerizing mathematical art.
          Watch as AI reveals Fibonacci sequences, golden ratios,
          and fractal beauty in stunning visualizations.
        </p>

        <button
          onClick={goToCommunity}
          className="
            mt-10 px-10 py-3 text-lg rounded-full
            border border-cyan-300 text-cyan-300
            hover:bg-cyan-300 hover:text-black
            transition-all duration-300
            shadow-[0_0_12px_rgba(0,255,255,0.4)]
          "
        >
          Explore Community
        </button>
      </div>
    </div>
  );
}
