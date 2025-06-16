/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'miami-pink': '#ff6b9d',
        'miami-blue': '#4ecdc4',
        'miami-purple': '#a8e6cf',
        'miami-orange': '#ffd93d',
        'miami-dark': '#2d1b69',
        'miami-darker': '#1a0f3a',
        'miami-light': '#f8f9ff',
      },
      zIndex: {
        '9999': '9999',
      },
      animation: {
        'slideInUp': 'slideInUp 0.4s ease-out',
      },
      keyframes: {
        'slideInUp': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
} 