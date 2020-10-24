// Tailwind Config

const { colors } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    colors: {
      primary: {
        default: '#00421f', // '#7f6c5e',
        800: '#00421f', // '#7f6c5e',
        700: '#00421f', // '#7f6c5e',
        600: '#4da977', // '#b9aba1',
        500: colors.white,
        200: '#4da977', // '#b9aba1',
        100: '#4da977', // '#b9aba1',
      },
      secondary: {
        default: '#772583', // '#c42026',
        800: '#772583', // '#b42026',
        700: '#853b8f', // '#c42026',
        600: '#ffd86b', // '#d3855f',
        200: '#ffeec0', // '#e0a778',
        100: '#ffeec0', // '#e0a778',
      },
      accent: {
        default: '#339d64', // '#b9aba1',
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
  plugins: [],
  corePlugins: {
    container: false,
  }
}
