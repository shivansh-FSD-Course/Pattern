/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        space: ["Space Grotesk", "sans-serif"],
      },

      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        glyphFloat: {
          "0%": { transform: "translateY(0)", opacity: "0.2" },
          "100%": { transform: "translateY(-140vh)", opacity: "0" },
        },
        aurora: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        flashOut: {
          "0%": { opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        exitShrink: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.7)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.8" }
        },
        glyphFloat: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
          "100%": { transform: "translateY(0px)" }
        }
      },

      animation: {
        twinkle: "twinkle 4s ease-in-out infinite",
        glyphFloat: "glyphFloat 12s linear infinite",
        aurora: "aurora 15s linear infinite",
        flashOut: "flashOut 0.9s ease-out forwards",
        exitShrink: "exitShrink 0.8s ease-in forwards",
        twinkle: "twinkle 3s ease-in-out infinite",
        glyphFloat: "glyphFloat 6s ease-in-out infinite",
        spinSlow: "spin 28s linear infinite",
        spinReverse: "spinReverse 22s linear infinite",
      },
    },
  },
  plugins: [],
};
