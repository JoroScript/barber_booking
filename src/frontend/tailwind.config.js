/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./contexts/**/*.{js,jsx}",
    "./utilities/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#f59e0b',
        'secondary': '#111827',
      },
    },
  },
  plugins: [],
} 