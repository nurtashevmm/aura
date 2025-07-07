/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#0F0F10',
        'brand-surface': '#1A1A1C',
        'brand-text': '#B8B8C0',
        'brand-amber': {
          light: '#FFD48C',
          DEFAULT: '#FFB648',
          dark: '#E5A440',
        },
      },
    },
  },
  plugins: [],
};