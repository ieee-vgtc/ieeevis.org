// tailwind.config.js
const { colors } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
        colors: {
          primary: {
            default: '#0059AF',
            700: '#1571ca',
          },
          secondary: colors.yellow,
          neutral: colors.gray,
        }   
    }
  },
  variants: {},
  plugins: []
}

