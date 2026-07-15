/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7A3732',
          dark: '#5F2925',
          soft: '#F3E4E0',
        },
        cream: '#FFF9F3',
        card: '#FFFFFF',
        line: '#EADBD5',
        ink: {
          DEFAULT: '#3A2927',
          muted: '#8A736E',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 2px 10px rgba(122, 55, 50, 0.06)',
        lift: '0 6px 22px rgba(122, 55, 50, 0.12)',
      },
    },
  },
  plugins: [],
};
