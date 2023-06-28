/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#3B9B96",
        "light-shade": "#F5F2F2",
        "lighter-shade": "#f4f1f1cc",
        "light-accent": "#3b9b66",
        "dark-accent": "#525B9B",
        "dark-shade": "#1C1C1C",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
