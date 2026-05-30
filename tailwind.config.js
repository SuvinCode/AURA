/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          deep: 'var(--color-aura-deep)',
          card: 'var(--color-aura-card)',
          input: 'var(--color-aura-input)',
          border: 'var(--color-aura-border)',
          blue: 'var(--color-aura-blue)',
          purple: 'var(--color-aura-purple)',
          cyan: 'var(--color-aura-cyan)',
          green: 'var(--color-aura-green)',
          orange: 'var(--color-aura-orange)',
          text: 'var(--color-aura-text)',
          muted: 'var(--color-aura-muted)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'glow-pulse': 'glow-pulse 2s infinite alternate',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.8', boxShadow: '0 0 0 0 rgba(58, 107, 255, 0.4)' },
          '70%': { transform: 'scale(1.15)', opacity: '0.2', boxShadow: '0 0 0 10px rgba(58, 107, 255, 0)' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8', boxShadow: '0 0 0 0 rgba(58, 107, 255, 0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(176, 106, 255, 0.4)', borderColor: 'rgba(176, 106, 255, 0.4)' },
          '100%': { boxShadow: '0 0 15px rgba(176, 106, 255, 0.8)', borderColor: 'rgba(176, 106, 255, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
