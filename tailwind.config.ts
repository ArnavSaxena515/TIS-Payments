import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f3f5f9',
          100: '#e3e8f1',
          200: '#c2cce0',
          300: '#94a4c5',
          400: '#6577a5',
          500: '#465789',
          600: '#36446e',
          700: '#2b3759',
          800: '#1f2a44',
          900: '#131b30',
          950: '#0a1020',
        },
        accent: {
          DEFAULT: '#0fb5b5',
          dark: '#0a8c8c',
          light: '#5fd4d4',
        },
        ink: '#0a1020',
        paper: '#fafbfc',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,16,32,0.04), 0 1px 1px rgba(10,16,32,0.03)',
      },
    },
  },
  plugins: [],
}
export default config
