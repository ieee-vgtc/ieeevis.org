// Tailwind Config

const { colors } = require('tailwindcss/defaultTheme')
//#E9A34F
// 110 182 239 primary #6EB6EF
// 233 163 79 secondary #E9A34F
// 63 101 127 other #3F657F

module.exports = {
  theme: {
    colors: {
      primary: {
        default:'#3F657F',//'#8ca8c4',// '#701c00',//'#841617',//#26853c', // '#7f6c5e',
        800: '#3F657F',//'#8ca8c4',//'#004c03', // '#7f6c5e',
        700: '#3F657F',//'#8ca8c4',//'#00661c', // '#7f6c5e',
        600: '#3F657F',//'#8ca8c4',//'#7db68a', // '#b9aba1',
        500: colors.white,
        200: '#6EB6EF',//'#8ca8c4',//'#6aa868', // '#b9aba1',
        100: '#6EB6EF',//colors.white, // '#b9aba1',
      },
      secondary: {
        default: '#6EB6EF',//'#8ca8c4', //'#1d3160',//'#6f2184', // '#c42026',
        800: '#6EB6EF',//'#8ca8c4',//'#1d3160',//'#6f2184', // '#b42026',
        700: '#6EB6EF',//'#8ca8c4',//'#8c3800',//'#853899', // '#c42026',
        600: '#6EB6EF',//'#8ca8c4',//'#9b4faf', // '#d3855f',
        200: '#6EB6EF',//colors.white, // '#e0a778',
        100: '#6EB6EF',//colors.white, // '#e0a778',
      },
      accent: {
        default: '#6EB6EF',//'#8ca8c4',// '#1d3160',//'#6f2184', // '#b9aba1',,
        minor: '#E9A34F',//'#8ca8c4',// '#fbc31b',
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
