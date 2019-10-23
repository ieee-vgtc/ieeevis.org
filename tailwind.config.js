// Tailwind Config

const { colors } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    colors: {
      primary: {
        default: '#846247',
        800: '#4e3a2a',
        700: '#846247',
        600: '#b3855f',
        200: '#e0a778',
        100:'#e0a778',
      },
      secondary: {
        default: '#dc4400',
        800: '#dc4400',
        700: '#e46b36',
        600: '#de8e6b',
        200: '#edb8a1',
        100:'#edb8a1',
      },
      accent: {
        default: '#ffc5ac',
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
