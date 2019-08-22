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
        },
    },

    fontFamily: {
      'zilla': ['"Zilla Slab"', 'serif'],
      'fira': ["'Fira Sans'", 'sans-serif']
    },

    fontSize: {
      'xl': '38px',
      'lg': '32px',
      'md': '22px',
      'sm': '18px',
      'xs': '16px',
      '2xs': '14px',
    },

    borderWidth: {
      default: '1px',
      '0': '0',
      '2': '2px',
      '3': '3px',
      '4': '4px',
      '8': '8px',
    },
  },

  variants: {},
  plugins: []
}
