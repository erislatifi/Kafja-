/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        proit: {
          black: '#0d0f0d',
          dark: '#161916',
          panel: '#1e221e',
          border: '#2b2f2b',
          lime: '#a6e635',
          'lime-dark': '#8bc926',
          'lime-light': '#c3f566',
          muted: '#8a8f8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
