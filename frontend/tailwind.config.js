/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0D0B09",
          900: "#12100D",
          800: "#1C1815",
          700: "#2A241E",
          600: "#3B332A",
        },
        paper: {
          DEFAULT: "#F6F1E4",
          line: "#DED2AE",
          dim: "#EDE4CD",
        },
        stamp: "#AD3B2C",
        brass: "#B8894A",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0 },
        },
        stampIn: {
          "0%": { opacity: 0, transform: "scale(1.6) rotate(-18deg)" },
          "60%": { opacity: 1, transform: "scale(0.92) rotate(-8deg)" },
          "100%": { opacity: 1, transform: "scale(1) rotate(-8deg)" },
        },
        printOut: {
          "0%": { opacity: 0, transform: "translateY(-14px)", clipPath: "inset(0 0 100% 0)" },
          "100%": { opacity: 1, transform: "translateY(0)", clipPath: "inset(0 0 0% 0)" },
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        blink: "blink 1s step-start infinite",
        stampIn: "stampIn 0.5s cubic-bezier(.2,1.4,.4,1) forwards",
        printOut: "printOut 0.5s ease-out forwards",
        rise: "rise 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
