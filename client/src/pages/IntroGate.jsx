import React, { useState } from "react";

export default function IntroGate({ onEnter }) {
  const [exit, setExit] = useState(false);

  const handleEnter = () => {
    setExit(true);
    setTimeout(() => onEnter(), 900);
  };

  const symbols = ["π","φ","∑","∞","λ","μ","Δ","σ","ƒ","ψ","Ω","θ","η","τ","β"];

  // CRT scanlines
  const crtStyle = {
    backgroundImage:
      "repeating-linear-gradient(rgba(0,255,0,0.07) 0px, rgba(0,255,0,0.07) 2px, transparent 2px, transparent 4px)",
  };

  // Radial breathing glow
  const glowStyle = {
    background:
      "radial-gradient(circle, rgba(0,255,100,0.15), transparent 70%)",
  };

  return (
    <div
      className="
        relative w-full h-screen bg-black overflow-hidden flex justify-center items-center
      "
    >
      {/* ─────────────────────────────── */}
      {/* CRT SCANLINES */}
      {/* ─────────────────────────────── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-40"
        style={crtStyle}
      ></div>

      {/* ─────────────────────────────── */}
      {/* RADIAL GLOW */}
      {/* ─────────────────────────────── */}
      <div
        className="
          absolute w-[600px] h-[600px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
          blur-[70px] animate-pulseGlow
        "
        style={glowStyle}
      ></div>

      {/* ─────────────────────────────── */}
      {/* FLOATING FORMULAS */}
      {/* ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="
              absolute text-[26px] text-[#65ff8f] opacity-20 
              drop-shadow-[0_0_6px_#65ff8f]
              animate-[floatFormula_12s_linear_infinite]
            "
            style={{
              left: `${Math.random() * 100}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            {symbols[i % symbols.length]}
          </span>
        ))}
      </div>

      {/* ─────────────────────────────── */}
      {/* WHITE FLASH ON EXIT */}
      {/* ─────────────────────────────── */}
      <div
        className={`
          absolute inset-0 bg-white opacity-0 pointer-events-none z-[9999]
          ${exit ? "animate-[flashOut_0.9s_ease-out_forwards]" : ""}
        `}
      ></div>

      {/* ─────────────────────────────── */}
      {/* CONTENT */}
      {/* ─────────────────────────────── */}
      <div
        className={`
          relative z-50 text-center transition-all duration-500
          ${exit ? "animate-[exitCollapse_0.8s_ease-in_forwards]" : ""}
        `}
      >
        <h1
          className="
            text-[64px] text-[#9aff9a] 
            drop-shadow-[0_0_22px_#9aff9a,0_0_40px_#4fff4f]
            tracking-[4px] mb-2
          "
        >
          PATTERNCRAFT
        </h1>

        <p className="text-[18px] text-[#e6e6d5] opacity-85 mb-10">
          A Portal Into Mathematical Worlds
        </p>

        <button
          onClick={handleEnter}
          className="
            px-10 py-3 border-2 border-neonGreen text-neonGreen 
            uppercase tracking-[1px] font-mono
            transition-all duration-200 
            hover:bg-neonGreen hover:text-black hover:shadow-[0_0_25px_#8aff8a]
          "
        >
          ENTER PATTERNCRAFT
        </button>
      </div>
    </div>
  );
}
