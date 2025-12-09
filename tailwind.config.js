// Tailwind Config

const { colors } = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./_site/*.html'],
  theme: {
    colors: {
      primary: {
        default: '#f58220',
        800: '#934E13',
        700: '#C4681A',
        600: '#f58220',
        500: '#F79B4D',
        200: '#F9B479',
        100: colors.white
      },
      secondary: {
        default: '#e11783',
        800: '#B41268',
        700: '#e11783',
        600: '#E7459C',
        200: '#ED74B5',
        100: colors.white,
      },
      accent: {
        default: '#693a19',
        minor: '#f58220',
        blue: '#e11783',
      },
      black: colors.black,
      white: colors.white,
      gray: {
        '100': '#feffff',
        '200': '#f2f3f2',
        '300': '#e6e7e4',
        '400': '#bdbdbd',
        '500': '#9e9e9e',
        '600': '#757575',
        '700': '#616161',
        '800': '#424242',
        '900': '#212121',
      }, //colors.gray,
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
