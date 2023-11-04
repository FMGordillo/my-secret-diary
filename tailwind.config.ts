import { type Config } from "tailwindcss";
import daisyui from "daisyui";
// import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--geist-font)"],
      },
      animation: {
        "bounce-right": "bounce-right 1s infinite",
      },
      keyframes: {
        "bounce-right": {
          "0%, 100%": {
            transform: "translateX(-25%)",
            "animation-timing-function": "cubic-bezier(0.8,0,1,1)",
          },
          "50%": {
            transform: "none",
            "animation-timing-function": "cubic-bezier(0,0,0.2,1)",
          },
        },
      },
    },
  },
  daisyui: {
    themes: [
      {
        myTheme: {
          primary: "#991b1b",
          secondary: "#ea580c",
          accent: "#eab308",
          neutral: "#2a323c",
          "base-100": "#1d232a",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
    ],
  },
  plugins: [daisyui],
} satisfies Config;
