/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef7ed",
          100: "#fdeed5",
          200: "#fbd9aa",
          300: "#f8be74",
          400: "#f4993c",
          500: "#ec7f13",
          600: "#d66e0b",
          700: "#b2590c",
          800: "#914711",
          900: "#773c11",
          DEFAULT: "#ec7f13", // Added for "bg-primary"
        },
        "primary-hover": "#d56f0e",
        "background-light": "#f8f7f6",
        "background-dark": "#221910",
        "surface-light": "#ffffff",
        "surface-dark": "#2d241b",
        "text-main": "#181411",
        "text-muted": "#897561",
        "text-secondary": "#9c7349", // Added from HTML template
        "border-color": "#f4ede7", // Added from HTML template
        "primary-light": "#fff0e0",
        "primary-dark": "#c26100",
        "recruit-bg": {
          light: "#f8f7f6",
          dark: "#221910",
        },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
