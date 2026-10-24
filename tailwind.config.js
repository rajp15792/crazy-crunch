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
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#166534', // Rich Forest Green
          700: '#14532d', // Deep Emerald
          800: '#0f382c', // Royal Dark Green
          900: '#09261d',
          950: '#041711',
        },
        greenTheme: {
          dark: '#0f382c',
          forest: '#1b4332',
          emerald: '#2d6a4f',
          light: '#d8f3dc'
        },
        gold: {
          50: '#fdfbf0',
          100: '#faf5dc',
          200: '#f4e7b0',
          300: '#edd680',
          400: '#e5c07b',
          500: '#d4af37', // Royal Gold
          600: '#c5a059', // Brass Gold
          700: '#996515',
          800: '#734c11',
          900: '#54370d'
        },
        cream: {
          50: '#fffdfa',
          100: '#fdfbf7', // Warm canvas background
          200: '#f9f6f0',
          300: '#f4ede2',
          400: '#e8dcce'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
}
