/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        playfair: ['"Playfair Display"', "serif"],
        markazi: ['"Markazi Text"', "serif"],
      },
      colors: {
        bgDark: "#2c2c2e",
        bgPrimary: "#2FB5B4",
      },
      screens: {
        short: { raw: "(max-height: 700px)" },
      },
    },
  },
  plugins: [],
};
