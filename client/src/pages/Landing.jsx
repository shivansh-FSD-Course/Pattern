import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  // Glyphs for the two rings
  const outerGlyphs = useMemo(
    () => ["π", "φ", "∞", "Σ", "∫", "ψ", "λ", "∆", "Ω", "μ", "det", "log"],
    []
  );

  const innerGlyphs = useMemo(
    () => ["3", "5", "8", "13", "e", "i", "sin", "cos", "f(x)", "{ }", "∂", "√"],
    []
  );

  // Lightweight "data stream" strings drifting behind everything
  const dataStreams = useMemo(() => {
    const lines = [
      "1, 1, 2, 3, 5, 8, 13",
      "0.1, 0.3, 0.9",
      "sin(x), cos(x)",
      "e^x, ln(x)",
      "1.618, 2.618",
      "3, 5, 8, 13, 21",
      "O(n log n)",
      "P(A|B)",
      "µ, σ²",
      "corr(x, y)",
      "argmax θ",
      "∫ f(t) dt",
      "x² + y² = r²",
      "λ₁, λ₂, …"
    ];

    return lines.map((text, index) => ({
      id: index,
      text,
      left: Math.random() * 100, // vw
      top: Math.random() * 80, // vh-ish, stays mostly in view
      duration: 18 + Math.random() * 16,
      delay: Math.random() * 20,
      opacity: 0.04 + Math.random() * 0.05,
      fontSize: 10 + Math.random() * 4
    }));
  }, []);

  // Mouse tilt for the central hero section
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(e) {
      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const yNorm = (e.clientY - innerHeight / 2) / (innerHeight / 2);

      // gentle tilt
      setTilt({
        x: yNorm * 4, // rotateX
        y: -xNorm * 4 // rotateY
      });
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="landing-container">
      {/* HEADER */}
      <header className="landing-header">
        <h1 className="logo-text">PATTERNCRAFT</h1>

        <div className="header-buttons">
          <button className="header-btn" onClick={() => navigate("/login")}>
            LOGIN
          </button>
          <button className="header-btn" onClick={() => navigate("/register")}>
            REGISTER
          </button>
        </div>
      </header>

      {/* CRT pixel noise + scanlines are done in CSS pseudo-elements */}

      {/* DATA STREAMS */}
      <div className="data-stream-layer">
        {dataStreams.map((stream) => (
          <span
            key={stream.id}
            className="data-stream"
            style={{
              left: `${stream.left}vw`,
              top: `${stream.top}vh`,
              animationDuration: `${stream.duration}s`,
              animationDelay: `${stream.delay}s`,
              opacity: stream.opacity,
              fontSize: `${stream.fontSize}px`
            }}
          >
            {stream.text}
          </span>
        ))}
      </div>

      {/* RADAR + SPIRAL */}
      <div className="radar-ring"></div>
      <div className="radar-sweep"></div>
      <div className="fib-spiral"></div>

      {/* GLYPH RINGS */}
      <div className="glyph-layer glyph-layer-outer">
        {outerGlyphs.map((g, i) => (
          <span
            key={`outer-${i}`}
            className="glyph-wrapper"
            style={{
              transform: `rotate(${i * (360 / outerGlyphs.length)}deg) translate(360px)`
            }}
          >
            <span
              className="glyph glyph-outer"
              style={{ animationDelay: `${Math.random() * 2.2}s` }}
            >
              <span className="glyph-core" />
              {g}
            </span>
          </span>
        ))}
      </div>

      <div className="glyph-layer glyph-layer-inner">
        {innerGlyphs.map((g, i) => (
          <span
            key={`inner-${i}`}
            className="glyph-wrapper"
            style={{
              transform: `rotate(${i * (360 / innerGlyphs.length)}deg) translate(270px)`
            }}
          >
            <span
              className="glyph glyph-inner"
              style={{ animationDelay: `${Math.random() * 2.2}s` }}
            >
              <span className="glyph-core" />
              {g}
            </span>
          </span>
        ))}
      </div>

      {/* MAIN HERO (tilt-reactive) */}
      <main
        className="landing-hero"
        style={{
          transform: `translate(-50%, -50%) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
        }}
      >
        <div className="hero-glow" />

        <h2 className="landing-title">
          DISCOVER HIDDEN
          <br />
          PATTERNS
        </h2>

        <p className="landing-subtitle">
          Upload your data and let PatternCraft uncover the
          <br />
          math that shapes it.
        </p>

        <button className="cta-btn" onClick={() => navigate("/login")}>
          ENTER THE COMMUNITY
        </button>
      </main>
    </div>
  );
}
