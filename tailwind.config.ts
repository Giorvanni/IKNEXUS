import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{css,scss}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f7f8f5',
          100: '#eef1ea',
          200: '#d9e0cf',
          300: '#c1ccb3',
          400: '#a3b391',
          500: '#8e9f79',
          600: '#6f865d',
          700: '#5c704d',
          800: '#495a3e',
          900: '#38452f',
        },
        accent: '#D4A373'
      },
      fontFamily: {
        // Bound to CSS variables provided by next/font for optimal loading
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif']
      },
      boxShadow: {
        card: '0 4px 12px -2px rgba(0,0,0,0.12)',
      }
    }
  },
  plugins: []
}
export default config
