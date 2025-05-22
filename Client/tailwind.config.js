/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        markazi: ['"Markazi Text"', "serif"],
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        bgDark: "#2c2c2e",
        bgPrimary: "#2FB5B4",
        primary: "#017776",
        secondary: "#F4F4F5",
      },
      screens: {
        short: { raw: "(max-height: 700px)" },
      },
    },
  },
  plugins: [],
};
