// Tailwind Config
// Restart development server to see any changes made here

const { colors } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
        colors: {
          primary: {
            default: '#0059AF',
            700: '#1571ca',
          },
          secondary: '#D8FFFC',
        }   
    },
    fontFamily: {
      'zilla': ['"Zilla Slab"', 'serif'],
      'fira': ["'Fira Sans'", 'sans-serif']
    }
  },
  variants: {},
  plugins: []
}
