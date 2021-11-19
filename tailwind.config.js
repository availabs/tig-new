const defaultTheme = require('tailwindcss/defaultTheme');

const colors = require('tailwindcss/colors');

module.exports = {
  theme: {
    purge: ["./public/**/*.html", "./src/**/*.{js,jsx}"],
    borderColor: theme => ({
      ...theme('colors'),
      default: theme('currentColor')
    }),
    extend: {
      colors: {
        teal: colors.teal,
        blueGray: colors.blueGray,
        cyan: colors.cyan,
        darkblue: {
            '50': '#f4f5f6', 
            '100': '#eaeaec', 
            '200': '#caccd1', 
            '300': '#a9adb5', 
            '400': '#696f7d', 
            '500': '#293145', 
            '600': '#252c3e', 
            '700': '#1f2534', 
            '800': '#191d29', 
            '900': '#141822'
        },
          tigGray: {
            '50': '#EEEEEE',
            '100': '#E6E6E6',
            '200': '#D2D2D2'
          },
          tigGreen: {
            '100': '#679d89'
          }
      },
      fontFamily: {
        sans: ['Proxima Nova W01', 'Inter var', ...defaultTheme.fontFamily.sans],
        serif: ['Alfa Slab One', ...defaultTheme.fontFamily.serif]
      },
    }
  },
  variants: {
  },
  plugins: [
  ]
}
