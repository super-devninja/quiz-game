/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D680FF',
        secondary: '#30193A',
      },
      fontFamily: {
        august: ['August', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

