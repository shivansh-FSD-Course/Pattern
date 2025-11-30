import { useState, useMemo } from "react";

export default function IntroGate({ onEnter }) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 900);
  };

  // Generate random mathematical symbols scattered across the screen
  const mathSymbols = useMemo(() => {
    const symbols = ["φ", "π", "∑", "∞", "ψ", "∂", "√", "≡", "∫", "λ", "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "κ", "μ", "ν", "ξ", "ρ", "σ", "τ", "ω", "Γ", "Δ", "Θ", "Λ", "Ξ", "Π", "Σ", "Φ", "Ψ", "Ω"];
    
    return Array.from({ length: 50 }).map((_, i) => ({
      char: symbols[Math.floor(Math.random() * symbols.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 30 + Math.random() * 40,
      opacity: 0.02 + Math.random() * 0.04,
      rotation: Math.random() * 360,
      animationDelay: Math.random() * 5,
      animationDuration: 8 + Math.random() * 12, // Faster: 8-20s instead of 20-40s
      // Random direction for movement
      direction: Math.random() > 0.5 ? 1 : -1,
      // Random horizontal drift
      drift: (Math.random() - 0.5) * 40,
    }));
  }, []);

  // Generate elegant spiral paths
  const spirals = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      left: Math.random() * 90,
      top: Math.random() * 90,
      size: 300 + Math.random() * 200,
      opacity: 0.03 + Math.random() * 0.03,
      rotation: Math.random() * 360,
      animationDelay: Math.random() * 3,
      animationDuration: 15 + Math.random() * 15,
    }));
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-paper text-ink overflow-hidden px-4">
    
      {/*
          ✧ FLOATING MATHEMATICAL FIELD 
     */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* ELEGANT SPIRALS WITH ROTATION */}
        {spirals.map((spiral, i) => (
          <svg
            key={`spiral-${i}`}
            viewBox="0 0 400 400"
            className="absolute stroke-ink"
            style={{
              left: `${spiral.left}%`,
              top: `${spiral.top}%`,
              width: `${spiral.size}px`,
              opacity: spiral.opacity,
              animation: `spiralFloat ${spiral.animationDuration}s ease-in-out infinite, spiralRotate ${spiral.animationDuration * 2}s linear infinite`,
              animationDelay: `${spiral.animationDelay}s`,
            }}
            fill="none"
            strokeWidth="1.2"
          >
            <path d="M200 200 
            Q200 120 280 120
            Q360 120 360 200
            Q360 300 240 300
            Q90 300 90 160
            Q90 40 260 40" />
          </svg>
        ))}

        {/* SCATTERED MATHEMATICAL SYMBOLS WITH VISIBLE MOVEMENT */}
        {mathSymbols.map((symbol, i) => (
          <span
            key={`symbol-${i}`}
            className="absolute font-serif select-none"
            style={{
              left: `${symbol.left}%`,
              top: `${symbol.top}%`,
              fontSize: `${symbol.size}px`,
              opacity: symbol.opacity,
              animation: `mathFloat ${symbol.animationDuration}s ease-in-out infinite`,
              animationDelay: `${symbol.animationDelay}s`,
              '--drift': `${symbol.drift}px`,
              '--direction': symbol.direction,
            }}
          >
            {symbol.char}
          </span>
        ))}
      </div>

      {/* 
          ✧ CONTENT WRAPPER - Constrained width
      */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[90vw] sm:max-w-[600px] md:max-w-[720px]">
        
        {/* 
            ✧ HANDWRITTEN SVG LOGO - Responsive sizing
        */}
        <svg
          width="100%"
          height="auto"
          viewBox="0 0 720 130"
          className={`mb-4 sm:mb-6 transition-opacity duration-500 ${
            exiting ? "opacity-0" : ""
          }`}
          preserveAspectRatio="xMidYMid meet"
        >
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontFamily="'Dancing Script', cursive"
            fontSize="100"
            stroke="#2C2C2C"
            strokeWidth="2"
            fill="transparent"
            className="pc-write"
            style={{
              strokeDasharray: 1600,
              strokeDashoffset: 1600,
            }}
          >
            PATTERNCRAFT
          </text>
        </svg>

        {/* SUBTITLE - Responsive text size */}
        <p
          className={`font-serif text-sm sm:text-base md:text-lg opacity-0 text-center px-4
          ${!exiting ? "animate-[fadeIn_1s_ease-out_2.6s_forwards]" : ""}`}
        >
          Where numbers become art
        </p>

        {/* 
    ENTER BUTTON - Simple and centered
*/}
        <button
          onClick={handleEnter}
          className={`
            mt-8 sm:mt-10 px-12 py-3
            border-2 border-ink/40 rounded-sm
            text-ink font-sans text-sm tracking-widest uppercase
            hover:bg-ink hover:text-paper hover:border-ink
            transition-all duration-300
            opacity-0
            ${!exiting ? "animate-[fadeIn_1s_ease-out_3.3s_forwards]" : ""}
          `}
        >
          Enter
        </button>
      </div>

      {/* EXIT FLASH */}
      <div
        className={`absolute inset-0 bg-white opacity-0 pointer-events-none
        ${exiting ? "animate-[flashOut_0.9s_ease-out_forwards]" : ""}`}
      />
    </div>
  );
}