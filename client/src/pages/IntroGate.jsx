import { useState } from "react";

export default function IntroGate({ onEnter }) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 900);
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-paper text-ink overflow-hidden">
    {/* FLOATING BACKGROUND MATH DECOR */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.09]">

      {/* BIG CENTER SPIRAL */}
      <svg
        viewBox="0 0 400 400"
        className="absolute left-[14%] top-[22%] w-[520px] math-float"
        fill="none"
        stroke="#2C2C2C"
        strokeWidth="1.2"
        opacity="0.10"
      >
        <path d="M200 200 Q200 120 280 120 Q360 120 360 200 Q360 300 240 300 Q90 300 90 160 Q90 40 260 40" />
      </svg>

      {/* SMALLER SPIRAL RIGHT */}
      <svg
        viewBox="0 0 400 400"
        className="absolute right-[12%] bottom-[14%] w-[320px] math-float"
        fill="none"
        stroke="#2C2C2C"
        strokeWidth="1"
        opacity="0.08"
      >
        <path d="M200 200 Q200 150 250 150 Q300 150 300 200 Q300 260 230 260 Q130 260 130 170" />
      </svg>

      {/* SYMBOLS */}
      <span className="absolute left-[18%] top-[48%] text-[58px] opacity-[0.08] font-serif math-float">
        φ
      </span>
      <span className="absolute right-[14%] top-[30%] text-[70px] opacity-[0.07] font-serif math-float">
        π
      </span>
      <span className="absolute left-[48%] top-[18%] text-[52px] opacity-[0.07] font-serif math-float">
        ∞
      </span>
      <span className="absolute right-[30%] bottom-[18%] text-[65px] opacity-[0.07] font-serif math-float">
        Σ
      </span>
    </div>

      {/*
          ✧ FLOATING MATHEMATICAL FIELD 
     */}
      <div className="absolute inset-0 pointer-events-none">

        {/* SIX LARGE SPIRALS */}
        {[
          ["left-[10%] top-[12%] w-[480px] opacity-[0.06]"],
          ["right-[8%] top-[18%] w-[390px] opacity-[0.045]"],
          ["left-[22%] bottom-[10%] w-[420px] opacity-[0.055]"],
          ["right-[25%] bottom-[16%] w-[380px] opacity-[0.05]"],
          ["left-[48%] top-[40%] w-[520px] opacity-[0.035]"],
          ["right-[45%] bottom-[38%] w-[460px] opacity-[0.045]"],
        ].map((style, i) => (
          <svg
            key={i}
            viewBox="0 0 400 400"
            className={`absolute ${style} stroke-ink math-float`}
            fill="none"
            strokeWidth="1.15"
          >
            <path d="M200 200 
            Q200 120 280 120
            Q360 120 360 200
            Q360 300 240 300
            Q90 300 90 160
            Q90 40 260 40" />
          </svg>
        ))}

        {/* FLOATING GLYPHS */}
        {[
          ["φ", "left-[6%]  top-[28%]"],
          ["π", "left-[32%] top-[14%]"],
          ["∞", "right-[30%] top-[20%]"],
          ["Σ", "right-[12%] top-[44%]"],
          ["μ", "left-[14%] bottom-[22%]"],
          ["∂", "right-[18%] bottom-[19%]"],
          ["λ", "left-[45%] bottom-[10%]"],
          ["β", "right-[44%] top-[8%]"],
          ["Ω", "left-[50%] top-[70%]"],
          ["σ", "right-[6%] top-[60%]"],
          ["θ", "left-[28%] bottom-[34%]"],
          ["γ", "right-[32%] bottom-[28%]"],
        ].map(([glyph, pos], i) => (
          <span
            key={i}
            className={`absolute ${pos} text-[50px] font-serif opacity-[0.045] math-float`}
          >
            {glyph}
          </span>
        ))}
      </div>

      {/* ─────────────────────────────────────────────
          ✧ HANDWRITTEN SVG LOGO
      ───────────────────────────────────────────── */}
      <svg
        width="720"
        height="130"
        viewBox="0 0 720 130"
        className={`mb-6 transition-opacity duration-500 ${
          exiting ? "opacity-0" : ""
        }`}
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

      {/* SUBTITLE */}
      <p
        className={`font-serif text-lg opacity-0
        ${!exiting ? "animate-[fadeIn_1s_ease-out_2.6s_forwards]" : ""}`}
      >
        Where numbers become art
      </p>

      {/* ─────────────────────────────────────────────
          ✧ PREMIUM ENTER BUTTON
      ───────────────────────────────────────────── */}
      <button
        onClick={handleEnter}
        className={`
          mt-10 px-8 py-3 border border-ink/40 rounded-sm
          text-ink/70 text-sm tracking-wide font-sans
          transition-all duration-300
          hover:border-ink hover:bg-ink hover:text-paper
          group relative opacity-0
          ${!exiting ? "animate-[fadeIn_1s_ease-out_3.3s_forwards]" : ""}
        `}
      >
        ENTER
        <span
          className="
            absolute -right-6 top-1/2 -translate-y-1/2
            opacity-0 group-hover:opacity-100
            transition-all duration-300
          "
        >
          ➜
        </span>
      </button>

      {/* EXIT FLASH */}
      <div
        className={`absolute inset-0 bg-white opacity-0 pointer-events-none
        ${exiting ? "animate-[flashOut_0.9s_ease-out_forwards]" : ""}`}
      />
    </div>
  );
}
