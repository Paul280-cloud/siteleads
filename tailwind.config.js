/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#faf8ff",
        "surface-container": "#eaedff",
        "on-surface": "#131b2e",
        "on-surface-variant": "#464555",
        primary: "#4a4ae0",
      },
    },
  },
  plugins: [],
};
