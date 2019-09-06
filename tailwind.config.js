// Tailwind Config

const { colors } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    colors: {
      primary: {
        default: '#0059AF',
        800: '#085096',
        700: '#0059AF',
        600: '#337ABF',
        200: '#BFD5EB',
        100:'#E7F3FF',
      },
      secondary: {
        default: '#00A599',
        800: '#078A81',
        700: '#00A899',
        600: '#33B9AD',
        200: '#BFE9E5',
        100:'#E5F6F5',
      },
      accent: {
        default: '#D8FFFC',
      },
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
    },

    fontFamily: {
      'display': ['"Zilla Slab"', 'serif'],
      'body': ["'Fira Sans'", 'sans-serif']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
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
