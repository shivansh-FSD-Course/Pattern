import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const goldGlyphs = ["π","φ","∞","Σ","∫","e","i","ψ","λ","∆","Ω","μ"];
  const greenGlyphs = ["log","sin","cos","det","f(x)","∂","∇","θ","β","γ","δ"];

  // ⬇️ Animation before going to Community
  const handleEnterCommunity = () => {
    setLoading(true);
    setTimeout(() => navigate("/community"), 1300);
  };

  // ⬇️ Animation before going to Dashboard
  const handleMySpace = () => {
    setLoading(true);
    setTimeout(() => navigate("/dashboard"), 1300);
  };

  return (
    <div className="landing-container">

      {/* SCANLINE LOADER */}
      {loading && <div className="scanline-loader"></div>}

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

          {/* NEW — MY SPACE */}
          <button className="header-btn" onClick={handleMySpace}>
            MY SPACE
          </button>

        </div>
      </header>

      {/* CRT overlay */}
      <div className="crt-overlay"></div>

      {/* DATA STREAM BACKGROUND */}
      <div className="data-stream-layer"></div>

      {/* RADAR SWEEP */}
      <div className="radar-sweep"></div>

      {/* OUTER GLYPH RING — GOLD */}
      <div className="glyph-ring outer-ring">
        {goldGlyphs.map((g, i) => (
          <span
            key={`outer-${i}`}
            className="glyph-wrapper"
            style={{
              transform: `rotate(${i * (360 / goldGlyphs.length)}deg) translate(calc(35vmin))`
            }}
          >
            <span className="glyph gold-glyph">{g}</span>
          </span>
        ))}
      </div>

      {/* INNER GLYPH RING — GREEN */}
      <div className="glyph-ring inner-ring">
        {greenGlyphs.map((g, i) => (
          <span
            key={`inner-${i}`}
            className="glyph-wrapper"
            style={{
              transform: `rotate(${i * (360 / greenGlyphs.length)}deg) translate(calc(27vmin))`
            }}
          >
            <span className="glyph green-glyph">{g}</span>
          </span>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="landing-content">
        <div className="hero-glow"></div>

        <h2 className="landing-title">
          DISCOVER HIDDEN <br /> PATTERNS
        </h2>

        <p className="landing-subtitle">
          Upload your data and let PatternCraft uncover the <br />
          math that shapes it.
        </p>

        <button className="cta-btn" onClick={handleEnterCommunity}>
          ENTER THE COMMUNITY
        </button>
      </main>

    </div>
  );
}
