import React, { useState } from "react";
import "./IntroGate.css";

export default function IntroGate({ onEnter }) {
  const [exit, setExit] = useState(false);

  const handleEnter = () => {
    setExit(true);

    setTimeout(() => {
      onEnter();
    }, 900);
  };

  const symbols = ["π","φ","∑","∞","λ","μ","Δ","σ","ƒ","ψ","Ω","θ","η","τ","β"];

  return (
    <div className={`gate-container ${exit ? "gate-exit" : ""}`}>
      
      {/* WHITE FLASH */}
      <div className="flash-layer"></div>

      {/* FLOATING FORMULAS */}
      <div className="formula-layer">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="formula-floating"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 8}s`
            }}
          >
            {symbols[i % symbols.length]}
          </span>
        ))}
      </div>

      {/* CONTENT */}
      <div className={`portal-wrapper ${exit ? "fade-out" : ""}`}>
        <h1 className="gate-title">PATTERNCRAFT</h1>
        <p className="gate-sub">A Portal Into Mathematical Worlds</p>
        <button className="gate-btn" onClick={handleEnter}>
          Enter PatternCraft
        </button>
      </div>
    </div>
  );
}
