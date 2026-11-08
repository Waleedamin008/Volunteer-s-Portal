/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#001830',
          darkNavy: '#001028',
          gold: '#D0A860',
          lightGold: '#E5C383',
          warmIvory: '#F0E8E0',
          ivoryBg: '#FAF7F2',
          charcoal: '#252525',
          mutedGray: '#777777',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        urdu: ['"Noto Nastaliq Urdu"', 'serif'],
      }
    },
  },
  plugins: [],
}

