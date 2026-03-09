/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f3ff',
          100: '#d9dbff',
          200: '#b1b6ff',
          300: '#7b7ffc',
          400: '#4f57f9',
          500: '#3a3cd0',
          600: '#2b2ea3',
          700: '#242a7f',
          800: '#1c2061',
          900: '#151748'
        }
      }
    }
  },
  plugins: []
};
