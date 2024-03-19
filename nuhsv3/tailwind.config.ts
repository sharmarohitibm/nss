import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "Roboto-Light": ["Roboto-Light"],
        "Roboto-Regular": ["Roboto-Regular"],
      },
      colors: {
        "nuhs-blue": "#2567CB",
        "nuhs-darkergrey": "#19212F",
        "nuhs-darkgrey": "#262E3E",
        "nuhs-grey": "#343C4B",
        "nuhs-lightgrey": "#8190B0",
        "nuhs-hovergrey": "#3A465B",
        "nuhs-greenstatus": "#5CD068",
        "nuhs-lightcolor": "#E1EBFF",
      },
      keyframes: {
        leftToRight: {
          "0%": {
            background:
              "linear-gradient(to left, #FFFFFF 50%, #434E62 50%) right",
            opacity: "0%",
          },
          "100%": { translateX: "0%", opacity: "50%" },
        },
      },
      animation: {
        leftToRight: "leftToRight 3s linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
