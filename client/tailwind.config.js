/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Crimson Pro", "serif"],
        sans: ["Inter", "sans-serif"],
      },

      colors: {
        paper: "#FDFBF7",
        ink: "#2C2C2C",
        accent: {
          gold: "#C9A961",
          green: "#7BA591",
          rust: "#C75B39",
        },
      },

      keyframes: {
        handwriting: {
          "0%": { strokeDashoffset: "100%" },
          "100%": { strokeDashoffset: "0%" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        flashOut: {
          "0%": { opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { opacity: "0" },
        }
      },

      animation: {
        handwriting: "handwriting 2.4s ease-out forwards",
        fadeIn: "fadeIn 0.8s ease-out forwards",
        flashOut: "flashOut 0.9s ease-out forwards",
      },
    },
  },
  plugins: [],
};
