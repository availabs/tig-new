module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
       colors: {
          tigGray: {
            '25': '#F9F9F9',
            '50': '#EEEEEE',
            '100': '#E6E6E6',
            '200': '#D2D2D2'
          },
          tigGreen: {
            '100': '#679d89'
          }
      },
        backgroundImage: {
           bus: "url('images/mapIcons/bus.png')"
        },
        boxShadow: {
           tigShadow: '0 0px 5px 1px rgba(38, 146, 248, 0.1)'
        }
      /*fontFamily: {
        sans: ['Proxima Nova W01', 'Inter var', ...defaultTheme.fontFamily.sans],
        serif: ['Alfa Slab One', ...defaultTheme.fontFamily.serif]
      },*/
    },
  },
  plugins: [],
}