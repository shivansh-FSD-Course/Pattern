/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        vt: ["VT323", "monospace"],
        pixel: ["Press Start 2P", "monospace"],

      },
      colors: {
        neonGreen: "#8aff8a",
        neonGold: "#ffe9a3",
        neonTeal: "#7cffda",
      },
      animation: {
        spinSlow: "spin 18s linear infinite",
        spinReverse: "spinReverse 14s linear infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        scanline: "scanline 0.15s linear infinite",
        radarSpin: "radarSpin 4s linear infinite",
        dataFloat: "dataFloat 10s linear infinite",
        fadeOut: "exitCollapse 0.8s ease-in forwards",
        flashOut: "flashOut 0.9s ease-out forwards",
        floatFormula: "floatFormula 12s linear infinite",
        crtFlicker: "crtFlicker 0.2s steps(2) infinite",
        scanline: "scanline 0.15s linear infinite",
        regFloat: "regFloat linear infinite",
        fadeInUp: "fadeInUp 0.6s ease-out",
        crtFlicker: "crtFlicker 0.2s steps(2) infinite",
        scanline: "scanline 0.15s linear infinite",
        floatUp: "floatUp linear infinite",
        floatUp: "floatUp linear infinite",
      },
      keyframes: {
        scanline: {
          from: { backgroundPositionY: "0" },
          to: { backgroundPositionY: "6px" },
        },
        spinReverse: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(-360deg)" },
        },
        pulseGlow: {
          "0%": { opacity: 0.6 },
          "50%": { opacity: 1 },
          "100%": { opacity: 0.6 },
        },
        floatFormula: {
          "0%": { transform: "translateY(20vh)", opacity: "0.05" },
          "50%": { opacity: "0.2" },
          "100%": { transform: "translateY(-30vh)", opacity: "0" },
        },
        flashOut: {
          "0%": { opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        exitCollapse: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.7)", opacity: "0" },
        },
        radarSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        dataFloat: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-20%)" },
        },
        crtFlicker: {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.94" },
          "100%": { opacity: "1" },
        },
        scanline: {
          from: { backgroundPositionY: "0" },
          to: { backgroundPositionY: "6px" },
        },
        regFloat: {
          "0%": { transform: "translateY(0)", opacity: "0.15" },
          "100%": { transform: "translateY(-18vh)", opacity: "0" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(35px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        crtFlicker: {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.97" },
          "100%": { opacity: "1" },
        },
        scanline: {
          from: { backgroundPositionY: "0" },
          to: { backgroundPositionY: "6px" },
        },
        floatUp: {
          from: { transform: "translateY(0)", opacity: "0.2" },
          to: { transform: "translateY(-140vh)", opacity: "0" }
        },
        floatUp: {
          from: { transform: "translateY(0)", opacity: "0.2" },
          to: { transform: "translateY(-140vh)", opacity: "0" }
        },
      },
    },
  },
  plugins: [],
};
