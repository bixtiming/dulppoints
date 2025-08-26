/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crypto-dark': '#0b0f14',
        'crypto-neon': '#00FF41',
        'crypto-purple': '#7c3aed',
        'crypto-gold': '#f59e0b',
        'crypto-silver': '#c0c0c0',
        'crypto-bronze': '#cd7f32',
        primary: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
