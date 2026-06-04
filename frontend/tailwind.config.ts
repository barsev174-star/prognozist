import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f7f8fb",
        ink: "#172033",
        muted: "#667085",
        accent: "#0f9f6e"
      }
    }
  },
  plugins: []
};

export default config;

