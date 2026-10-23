/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flux: {
          bg: '#0B0C10',
          sidebar: '#0E0F15',
          card: '#14161F',
          cardLight: '#1A1C27',
          border: '#212433',
          borderLight: '#2D3145',
          primary: '#FF5722',
          primaryHover: '#FF6E38',
          orangeGlow: 'rgba(255, 87, 34, 0.25)',
          secondary: '#7C4DFF',
          secondaryHover: '#8F65FF',
          tertiary: '#3B82F6',
          text: '#FFFFFF',
          textMuted: '#8E95A8',
          textDark: '#565C6E',
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 24px -4px rgba(255, 87, 34, 0.4)',
        'glow-purple': '0 0 24px -4px rgba(124, 77, 255, 0.4)',
        'glow-card': '0 8px 30px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
