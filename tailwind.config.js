/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#ECE7D8",
        "surface-container": "#DDD5BC",
        "on-surface": "#1B1B18",
        "on-surface-variant": "#5B5648",
        primary: "#1F3D2B",
        "primary-dark": "#15291D",
        accent: "#C98A2C",
        line: "#C9C2AC",
      },
      fontFamily: {
        display: ["\"Barlow Condensed\"", "sans-serif"],
        sans: ["\"IBM Plex Sans\"", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "monospace"],
      },
    },
  },
  plugins: [],
};
