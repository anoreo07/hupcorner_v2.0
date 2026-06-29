import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#F7F5F1',
          light: '#EFEDE9',
          dark: '#E8E4DE',
        },
        ink: {
          DEFAULT: '#111111',
          light: '#444444',
          lighter: '#777777',
          muted: '#AAAAAA',
        },
        red: {
          DEFAULT: '#D43B2C',
          light: '#E05A4A',
          dark: '#B83020',
        },
        black: {
          DEFAULT: '#0B0B0B',
          light: '#1A1A1A',
        },
        border: {
          DEFAULT: '#111111',
          light: '#CCCCCC',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '36': '9rem',
        '44': '11rem',
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'heading-1': ['3.5rem', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'heading-2': ['2.5rem', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'heading-3': ['1.75rem', { lineHeight: '1.15' }],
        'heading-4': ['1.25rem', { lineHeight: '1.25' }],
        'body': ['0.9375rem', { lineHeight: '1.7' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        'meta': ['0.625rem', { lineHeight: '1.2', letterSpacing: '0.12em' }],
      },
      maxWidth: {
        'reading': '68ch',
        'content': '1200px',
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        'DEFAULT': '0',
      },
      screens: {
        'print': { 'raw': 'print' },
      },
    },
  },
  plugins: [],
}

export default config
