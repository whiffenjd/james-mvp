/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        playfair: ['"Playfair Display"', "serif"],
        markazi: ['"Markazi Text"', "serif"],
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        bgDark: "#2c2c2e",
        bgPrimary: "#017776",
        primary: "#017776",
        secondary: "#F4F4F5",
        // Theme-based colors using CSS variables
        "theme-dashboard": "var(--dashboard-bg)",
        "theme-card": "var(--card-bg)",
        "theme-primary-text": "var(--primary-text) ",
        "theme-secondary-text": "var(--secondary-text)",
        "theme-sidebar-accent": "var(--sidebar-accent)",
      },
      backgroundColor: {
        "theme-dashboard": "var(--dashboard-bg)",
        "theme-card": "var(--card-bg)",
        "theme-sidebar-accent": "var(--sidebar-accent)",
      },
      textColor: {
        "theme-primary": "var(--primary-text)",
        "theme-secondary": "var(--secondary-text)",
        "theme-accent": "var(--sidebar-accent)",
      },
      borderColor: {
        "theme-primary": "var(--primary-text)",
        "theme-secondary": "var(--secondary-text)",
        "theme-accent": "var(--sidebar-accent)",
      },
    },
  },
  plugins: [],
};
