/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        magical: {
          dark: '#0a0b10',
          depth: '#11131f',
          accent: '#c084fc', 
          gold: '#facc15', 
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}