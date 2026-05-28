// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'youtube': {
          'red': '#FF0000',
          'dark': '#0F0F0F',
          'dark-2': '#181818',
          'dark-3': '#212121',
          'gray': '#303030',
          'light-gray': '#606060',
          'text': '#F1F1F1',
          'text-secondary': '#AAAAAA',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}