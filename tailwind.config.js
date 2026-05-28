/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        youtube: {
          dark: '#0f0f0f',
          'dark-2': '#0f0f0f', // Main background
          'dark-3': '#272727', // Secondary background (sidebar/header)
          gray: '#3f3f3f', // Borders/Separators
          red: '#ff0000',
          text: '#f1f1f1',
          'text-secondary': '#aaaaaa'
        }
      }
    },
  },
  plugins: [],
}
