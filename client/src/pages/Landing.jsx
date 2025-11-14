import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const goldGlyphs = ["π","φ","∞","Σ","∫","e","i","ψ","λ","∆","Ω","μ"];
  const greenGlyphs = ["log","sin","cos","det","f(x)","∂","∇","θ","β","γ","δ"];

  const handleEnterCommunity = () => {
    setLoading(true);
    setTimeout(() => navigate("/community"), 1300);
  };

  const handleMySpace = () => {
    setLoading(true);
    setTimeout(() => navigate("/dashboard"), 1300);
  };

  // binary background as data URI
  const dataStreamStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,<svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><text x='50%' y='50%' fill='rgba(0,255,0,0.07)' font-size='32' text-anchor='middle'>0101010101010101010101</text></svg>\")",
  };

  // radar sweep style
  const radarStyle = {
    backgroundImage:
      "conic-gradient(from 0deg, rgba(0,255,0,0.12), transparent 30%)",
  };

  // CRT overlay style
  const crtStyle = {
    backgroundImage:
      "repeating-linear-gradient(to bottom, rgba(0,255,0,0.03) 0px, rgba(0,255,0,0.03) 2px, transparent 3px)",
  };

  // scanline loader style
  const scanlineStyle = {
    backgroundImage:
      "repeating-linear-gradient(to bottom, rgba(0,255,0,0.2) 0px, rgba(0,255,0,0.15) 2px, rgba(0,255,0,0.05) 4px)",
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-vt text-[#e8ffe8]">

      {/* SCANLINE LOADER */}
      {loading && (
        <div
          className="fixed inset-0 z-[9999] backdrop-blur-sm animate-scanline pointer-events-none"
          style={scanlineStyle}
        />
      )}

      {/* HEADER */}
      <header className="absolute top-5 left-10 right-10 flex justify-between items-center z-50">
        <h1 className="text-[32px] text-neonGreen drop-shadow-[0_0_12px_#8aff8a]">
          PATTERNCRAFT
        </h1>

        <div className="flex gap-5">
          <button
            className="px-5 py-2 text-[16px] border-2 border-neonGreen text-neonGreen bg-transparent transition-colors duration-200 hover:bg-neonGreen hover:text-black"
            onClick={() => navigate("/login")}
          >
            LOGIN
          </button>

          <button
            className="px-5 py-2 text-[16px] border-2 border-neonGreen text-neonGreen bg-transparent transition-colors duration-200 hover:bg-neonGreen hover:text-black"
            onClick={() => navigate("/register")}
          >
            REGISTER
          </button>

          <button
            className="px-5 py-2 text-[16px] border-2 border-neonGreen text-neonGreen bg-transparent transition-colors duration-200 hover:bg-neonGreen hover:text-black"
            onClick={handleMySpace}
          >
            MY SPACE
          </button>
        </div>
      </header>

      {/* CRT OVERLAY */}
      <div
        className="pointer-events-none absolute inset-0 opacity-35 z-10"
        style={crtStyle}
      />

      {/* DATA STREAM BACKGROUND */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover animate-dataFloat z-20"
        style={dataStreamStyle}
      />

      {/* RADAR SWEEP */}
      <div
        className="pointer-events-none absolute inset-0 animate-radarSpin z-30"
        style={radarStyle}
      />

      {/* OUTER GLYPH RING — GOLD */}
      <div className="pointer-events-none absolute inset-0 w-full h-full z-40 animate-spinSlow">
        {goldGlyphs.map((g, i) => (
          <span
            key={`outer-${i}`}
            className="absolute top-1/2 left-1/2 origin-center pointer-events-none"
            style={{
              transform: `rotate(${i * (360 / goldGlyphs.length)}deg) translate(calc(35vmin))`,
            }}
          >
            <span className="text-[20px] opacity-[0.18] text-neonGold drop-shadow-[0_0_6px_currentColor]">
              {g}
            </span>
          </span>
        ))}
      </div>

      {/* INNER GLYPH RING — GREEN */}
      <div className="pointer-events-none absolute inset-0 w-full h-full z-40 animate-spinReverse">
        {greenGlyphs.map((g, i) => (
          <span
            key={`inner-${i}`}
            className="absolute top-1/2 left-1/2 origin-center pointer-events-none"
            style={{
              transform: `rotate(${i * (360 / greenGlyphs.length)}deg) translate(calc(27vmin))`,
            }}
          >
            <span className="text-[20px] opacity-[0.18] text-neonTeal drop-shadow-[0_0_6px_currentColor]">
              {g}
            </span>
          </span>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-50 text-center mt-[20vh]">
        {/* hero glow */}
        <div className="w-[350px] h-[350px] mx-auto blur-[100px] animate-pulseGlow bg-[radial-gradient(circle,rgba(0,255,180,0.25),transparent)]" />

        <h2 className="mt-[-140px] text-[58px] leading-[1.1em] text-[#fffad3] drop-shadow-[0_0_14px_#fff6a3] tracking-[2px]">
          DISCOVER HIDDEN <br /> PATTERNS
        </h2>

        <p className="mt-[18px] text-[17px] text-[#dcdcd0] opacity-90">
          Upload your data and let PatternCraft uncover the <br />
          math that shapes it.
        </p>

        <button
          className="relative z-50 mt-[35px] px-[38px] py-[14px] text-[16px] border-2 border-neonGreen text-neonGreen bg-transparent tracking-[1px] transition-colors duration-200 hover:bg-neonGreen hover:text-black"
          onClick={handleEnterCommunity}
        >
          ENTER THE COMMUNITY
        </button>
      </main>
    </div>
  );
}
