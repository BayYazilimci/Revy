/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1a2a3a',
        gold: '#e3d10d',
        orange: '#ff6b35',
        accent: '#e3d10d',
        accentLight: '#f0e447',
        accentDark: '#cabb0b',
        cream: '#faf7f2',
        softPink: '#fde8e8',
        softBlue: '#dbeafe',
        softMint: '#d1fae5',
        deep: '#1e1b2e',
        cardBorder: '#f0ece6',
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
