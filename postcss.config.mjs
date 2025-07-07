/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Явно указываем путь к нашему конфигу
    tailwindcss: {
      config: './tailwind.config.js', 
    },
    autoprefixer: {},
  },
};

export default config;