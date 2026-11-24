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
          DEFAULT: '#EC2028',
          red: '#EC2028',
          darkred: '#B91C1C',
          darker: '#991B1B',
          lightred: '#FEF2F2',
          accent: '#0F172A',
          gray: '#64748B',
          surface: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
      backgroundImage: {
        'telkomsel-gradient': 'linear-gradient(135deg, #EC2028 0%, #B91C1C 100%)',
        'telkomsel-radial': 'radial-gradient(circle at top right, #EC2028, #991B1B)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(236, 32, 40, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'floating': '0 20px 35px -10px rgba(15, 23, 42, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
