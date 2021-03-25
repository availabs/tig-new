const defaultTheme = require('tailwindcss/defaultTheme');

const colors = require('tailwindcss/colors');

module.exports = {
  theme: {
    borderColor: theme => ({
      ...theme('colors'),
      default: theme('currentColor')
    }),
    extend: {
      colors: {
        teal: colors.teal,
        blueGray: colors.blueGray,
        cyan: colors.cyan
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))'
      }
    }
  },
  variants: {
    extend: {
      ringColor: ['hover', 'active'],
      borderRadius: ['first', 'last'],
      borderColor: ['disabled'],
      margin: ['first', 'last'],
      padding: ['first', 'last'],
      cursor: ['disabled'],
      opacity: ['disabled'],
      fontWeight: ['disabled'],
      backgroundColor: ['disabled', 'active', 'first', 'last', 'odd', 'even'],
      textColor: ['disabled']
    }
  },
  plugins: [
  ]
}
