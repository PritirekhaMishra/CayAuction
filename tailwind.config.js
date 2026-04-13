/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        navy: {
          dark: "#040B1A",
          surface: "#0B1C2F",
          DEFAULT: "#0B1C2F",
        },
gold: {
          DEFAULT: "#C8A96A",
          light: "#E2C97E",
        },
        cream: "#F5F1E8",
      },

      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },

      boxShadow: {
        luxury: "0 25px 80px rgba(0,0,0,0.8)",
        "luxury-hover": "0 40px 120px rgba(0,0,0,0.95)",
        "glow-gold": "0 0 30px rgba(201,168,76,0.5)",
        cinematic: "0 30px 100px rgba(0,0,0,0.9)",
      },

      spacing: {
        '18': '4.5rem',
        '28': '7rem',
      },

      animation: {
        "fade-in": "fadeIn 0.8s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },

  plugins: [],
};

