import { type Config } from "tailwindcss";
import daisyui from "daisyui";
// import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    // extend: {
    //   fontFamily: {
    //     sans: ["var(--font-sans)", ...fontFamily.sans],
    //   },
    // },
  },
  plugins: [daisyui],
} satisfies Config;
