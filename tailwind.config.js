// Tailwind Config

const { colors } = require('tailwindcss/defaultTheme')
//#E9A34F
// 110 182 239 primary #6EB6EF light blue
// 233 163 79 secondary #E9A34F orange
// darker orange #a46314
// 63 101 127 other #3F657F dark blue

module.exports = {
	content: ['./_site/*.html'],
  theme: {
    colors: {
      primary: {
        default: '#DA171C', 
        800: '#DA171C',
        700: '#DE3135',
        600: '#E24B4E',
        500: '#E66468',
        200: '#F3B2B3',
        100: colors.white
      },
      secondary: {
        default: '#575756', //'#3F657F',//'#8ca8c4', //'#1d3160',//'#6f2184', // '#c42026',
        800: '#575756',//'#8ca8c4',//'#1d3160',//'#6f2184', // '#b42026',
        700: '#7e7e7d',//'#8ca8c4',//'#8c3800',//'#853899', // '#c42026',
        600: '#a7a7a7',//'#8ca8c4',//'#9b4faf', // '#d3855f',
        200: '#d2d2d2',//colors.white, // '#e0a778',
        100: colors.white,
      },
      accent: {
        default: '#575756', //'#3F657F',//'#8ca8c4',// '#1d3160',//'#6f2184', // '#b9aba1',,
        minor: '#DA171C',//'#8ca8c4',// '#fbc31b',
        blue: '#878787',//'#8ca8c4',// '#fbc31b',
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
