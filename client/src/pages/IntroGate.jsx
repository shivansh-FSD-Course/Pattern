import React, { useState } from "react";

export default function IntroGate({ onEnter }) {
  const [exit, setExit] = useState(false);

  const handleEnter = () => {
    setExit(true);
    setTimeout(() => onEnter(), 900);
  };

  const symbols = ["π","φ","∑","∞","λ","μ","Δ","σ","ƒ","ψ","Ω","θ","η","τ","β"];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex justify-center items-center font-space">

      {/* ─────── STARFIELD (TWINKLE) ─────── */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 180 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white/60 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random(),
            }}
          ></div>
        ))}
      </div>

      {/* ─────── FLOATING MATH GLYPHS ─────── */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {Array.from({ length: 35 }).map((_, i) => (
          <span
            key={i}
            className="
              absolute text-[26px] text-[#65ff8f] opacity-30
              drop-shadow-[0_0_6px_#65ff8f]
              animate-glyphFloat
            "
            style={{
              left: `${Math.random() * 100}%`,
              top: `${70 + Math.random() * 40}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${9 + Math.random() * 6}s`,
            }}
          >
            {symbols[i % symbols.length]}
          </span>
        ))}
      </div>

      {/* ─────── AURORA RING ─────── */}
      <div
        className="
          absolute w-[900px] h-[900px] rounded-full blur-[160px]
          animate-aurora opacity-40
        "
        style={{
          background:
            "conic-gradient(from 0deg, rgba(0,255,200,0.15), transparent 60%)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      ></div>

      {/* ─────── EXIT FLASH ─────── */}
      <div
        className={`
          absolute inset-0 bg-white opacity-0 pointer-events-none z-[9999]
          ${exit ? "animate-flashOut" : ""}
        `}
      ></div>

      {/* ─────── CONTENT ─────── */}
      <div
        className={`
          relative z-50 text-center transition-all duration-500
          ${exit ? "animate-exitShrink" : ""}
        `}
      >
        <h1
          className="
            text-[70px] text-transparent bg-clip-text 
            bg-gradient-to-r from-[#96dfff] via-[#d4b3ff] to-[#9affd3]
            drop-shadow-[0_0_22px_#8aefff]
            tracking-[4px] mb-4
          "
        >
          PATTERNCRAFT
        </h1>

        <p className="text-[20px] text-white/80 mb-10">
          Enter a Universe of Mathematical Patterns
        </p>

        <button
          onClick={handleEnter}
          className="
            px-10 py-3 rounded-full border border-[#68e6ff]
            text-[#96eaff] tracking-[1px]
            bg-black/20 backdrop-blur-md
            shadow-[0_0_15px_#0066aa66]
            transition-all duration-300
            hover:bg-[#96eaff] hover:text-black
            hover:shadow-[0_0_25px_#96eaff]
          "
        >
          ENTER
        </button>
      </div>
    </div>
  );
}
