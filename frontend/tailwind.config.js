/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telkomsel: {
          red: '#EC2028',
          darkred: '#B91C1C',
          darker: '#991B1B',
          lightred: '#FEF2F2',
          accent: '#1E293B',
          gray: '#64748B',
          lightgray: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
