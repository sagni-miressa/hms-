/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdeed5',
          200: '#fbd9aa',
          300: '#f8be74',
          400: '#f4993c',
          500: '#ec7f13',
          600: '#d66e0b',
          700: '#b2590c',
          800: '#914711',
          900: '#773c11',
        },
        'recruit-bg': {
          light: '#f8f7f6',
          dark: '#221910',
        },
      },
    },
  },
  plugins: [],
};

