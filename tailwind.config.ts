import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1A',
        secondary: '#6C63FF',
        success: '#34D399',
        error: '#F87171',
        neutral: {
          100: '#FAFAFA',
          200: '#E5E5E5',
        },
      },
    },
  },
  plugins: [],
}

export default config