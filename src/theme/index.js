const ppdaf = () => {

  // const bg = 'gray-50'
  const primary =  'nuetral'
  const highlight =  'white'
  const accent =  'blue'
  // const secondary =  'green'

  return {
    graphColors: [ '#1e40af','#93c5fd','#1d4ed8','#bfdbfe',],
    graphCategorical:  ['#eff6ff','#dbeafe','#bfdbfe','#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#1e40af','#1e3a8a'], //
    aaa: 'hi',
    sidenav: (opts={}) =>  {
      const {color='white',size='compact'} = opts
      let colors = {
        white: {
          contentBg: `bg-${highlight}`,
          contentBgAccent: `bg-neutral-100`,
          accentColor: `${accent}-600`,
          accentBg: `hover:bg-${accent}-400`,
          borderColor: `border-${primary}-100`,
          textColor: `text-${primary}-600`,
          textColorAccent: `text-slate-800`,
          highlightColor: `text-${primary}-800`,
        },
         dark: {
          contentBg: `bg-neutral-800`,
          contentBgAccent: `bg-neutral-900`,
          accentColor: `white`,
          accentBg: ``,
          borderColor: `border-neutral-700`,
          textColor: `text-slate-300`,
          textColorAccent: `text-slate-100`,
          highlightColor: `text-${highlight}`,
        },
        bright: {
          contentBg: `bg-${accent}-700`,
          accentColor: `${accent}-400`,
          accentBg: `hover:bg-${accent}-400`,
          borderColor: `border-${accent}-600`,
          textColor: `text-${highlight}`,
          highlightColor: `text-${highlight}`,
        }
      }

      let sizes = {
        none: {
          wrapper: "w-0 overflow-hidden",
          sideItem: "flex mx-2 pr-4 py-2 text-base hover:pl-2",
          topItem: "flex items-center text-sm px-4 border-r h-12",
          icon: "mr-3 text-lg",
        },
        compact: {
          fixed: 'pl-44',
          wrapper: "w-44",
          sideItem: "flex mx-2 pr-4 py-2 text-base hover:pl-2",
          topItem: "flex items-center text-sm px-4 border-r h-12",
          icon: "mr-3 text-lg",
        },
        full: {
          fixed: 'pl-64',
          wrapper: "w-64",
          sideItem: "flex mx-4 pr-4 py-4 text-base font-base border-b hover:pl-4",
          topItem: "flex pr-4 py-2 text-sm font-light",
          icon: "mr-4 text-2xl",
        },
        mini: {
          fixed: 'pl-20',
          wrapper: "w-20 overflow-x-hidden",
          sideItem: "flex pr-4 py-4 text-base font-base border-b",
          topItem: "flex px-4 items-center text-sm font-light ",
          icon: "w-20 mr-4 text-4xl",
        },
        micro: {
          fixed: 'pl-14',
          wrapper: "w-14 overflow-x-hidden",
          sideItem: "flex pr-4 py-4 text-base font-base border-b",
          topItem: "flex mx-6 pr-4 py-2 text-sm font-light",
          icon: "w-14 mr-4 text-2xl",
        },

      }

      return {
        fixed: `md:${sizes[size].fixed}`,
        logoWrapper: `${sizes[size].wrapper} ${colors[color].contentBgAccent} ${colors[color].textColorAccent}`,
        sidenavWrapper: `${colors[color].contentBg} ${sizes[size].wrapper} h-full hidden md:flex z-20`,
        menuIconSide: ` text-${colors[color].accentColor} ${sizes[size].icon} group-hover:${colors[color].highlightColor}`,
        itemsWrapper: `p-4 border-t ${colors[color].borderColor} ${sizes[size].wrapper}`,
        navitemSide: ` 
            group font-sans 
            ${sizes[size].sideItem} ${colors[color].textColor} ${colors[color].borderColor} 
            hover:${colors[color].highlightColor} 
            focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
            transition-all cursor-pointer
         `,

        navitemSideActive: `
            group font-sans 
            ${sizes[size].sideItem} ${colors[color].textColor} ${colors[color].borderColor} 
            hover:${colors[color].highlightColor} 
            focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
            transition-all cursor-pointer
          `,
          vars: {
            colors,
            sizes
          }
        }
    },


    /* -----
         Top Nav Theme Components Minimal
        ------*/
   topnav:  (opts={}) =>  {
      const {color='white',size='compact'} = opts
      let colors = {
        white: {
          contentBg: `bg-gray-50`,
          accentColor: `${accent}-600`,
          accentBg: `hover:bg-${accent}-600`,
          borderColor: `border-${primary}-100`,
          textColor: `text-${primary}-600`,
          highlightColor: `text-${highlight}`,
        },
        bright: {
          contentBg: `bg-${accent}-700`,
          accentColor: `${accent}-400`,
          accentBg: `hover:bg-${accent}-400`,
          borderColor: `border-${accent}-600`,
          textColor: `text-${highlight}`,
          highlightColor: `text-${highlight}`,
        }
      }
      let sizes = {
        compact: {
          wrapper: "w-64",
          sideItem: "flex mx-6 pr-4 py-2 text-sm font-light hover:pl-4",
          topItem: "flex items-center text-sm px-4 border-r h-12",
          icon: "mr-3 text-lg",
        },
        full: {
          wrapper: "w-64",
          sideItem: "flex mx-4 pr-4 py-4 text-base font-base border-b hover:pl-4",
          topItem: "flex pr-4 py-2 text-sm font-light",
          icon: "mr-4 text-2xl",
        },
      }


      return {
        topnavWrapper: `w-full ${colors[color].contentBg} `,
        topnavContent: `flex w-full h-full`,
        topnavMenu: `hidden md:flex flex-1 justify-end h-full overflow-x-auto overflow-y-hidden scrollbar-sm`,
        menuIconTop: `text-${colors[color].accentColor} ${sizes[size].icon} group-hover:${colors[color].highlightColor}`,
        menuOpenIcon: `fa fa-bars`,
        menuCloseIcon: `os-icon os-icon-x`,
        navitemTop: `group font-sans 
            ${sizes[size].topItem} ${colors[color].textColor} ${colors[color].borderColor} 
            ${colors[color].accentBg} hover:${colors[color].highlightColor} 
            focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
            transition cursor-pointer`,
        //`px-4 text-sm font-medium tracking-widest uppercase inline-flex items-center  border-transparent  leading-5 text-white hover:bg-white hover:text-darkblue-500 border-gray-200 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out h-full`,
        topmenuRightNavContainer: "hidden md:block h-full",
        navitemTopActive: `group font-sans
            ${sizes[size].topItem} ${colors[color].textColor} ${colors[color].borderColor} 
            ${colors[color].accentBg} hover:${colors[color].highlightColor} 
            focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
            transition cursor-pointer
        `,
        mobileButton:
          `md:hidden ${colors[color].contentBg} inline-flex items-center justify-center p-2  text-gray-400 hover:bg-gray-100 `,
        vars: {
            colors,
            sizes
          }
      }

    },

    select: ({color='white', size = 'full'}) => {

      let colors = {
        white: 'white',
        transparent: 'gray-100'
      }

      let sizes = {
          compact: 'px-0 py-0',
          full: 'px-4 py-2'
      }
      return {
          menuWrapper: `bg-${colors[color]} my-1 text-sm `,
          menuItemActive: `px-2 py-2 cursor-not-allowed bg-${accent}-200 border-1 border-${colors[color]} focus:border-${accent}-300`,
          menuItem: `px-2 py-2 cursor-pointer hover:bg-blue-100 border-1 border-${colors[color]} focus:border-blue-300`,
          select: `z-60 bg-${colors[color]} w-full flex flex-row justify-between truncate ${sizes[size]} cursor-pointer border-2 border-${colors[color]} focus:border-blue-300`,
          selectIcon: `fa fa-angle-down text-gray-400 pt-2 px-2`
        }
    },
      table: (opts = {color:'white', size: 'compact'}) => {
          const {color = 'white', size = 'compact'} = opts
          let colors = {
              white: 'bg-white hover:bg-gray-100',
              gray: 'bg-gray-100 hover:bg-gray-200',
              transparent: 'gray-100'
          }

          let sizes = {
              compact: 'px-4 py-1 text-sm',
              full: 'px-10 py-5'
          }
          return {
              tableHeader:
                  `${sizes[size]} pb-1 border-2 border-gray-300 bg-gray-50 text-left font-medium text-gray-700 uppercase first:rounded-tl-md last:rounded-tr-md capitalize`,
              tableInfoBar: "bg-white",
              tableRow: `${colors[color]} transition ease-in-out duration-150`,
              tableRowStriped: `bg-gray-50 odd:bg-gray-100 hover:bg-gray-200 transition ease-in-out duration-150`,
              tableCell: `${sizes[size]} whitespace-no-wrap border-2 border-gray-300`,
              inputSmall: 'w-24',
              vars: {
                  color: colors,
                  size: sizes
              }
          }
      },
    /* ------------------------- */
    shadow: "shadow",
    ySpace: "py-4",
    text: "text-gray-800",
    textContrast: "text-white",
    border: "broder-gray-400",

    textInfo: "text-blue-400",
    bgInfo: "bg-blue-400",
    borderInfo: "border-blue-400",

    textSuccess: "text-blue-400",
    bgSuccess: "bg-blue-400",
    borderSuccess: "border-blue-400",

    textDanger: "text-red-400",
    bgDanger: "bg-red-400",
    borderDanger: "border-red-400",

    textWarning: "text-yellow-400",
    bgWarning: "bg-yellow-400",
    borderWarning: "border-yellow-400",

    textLight: "text-gray-400", // <-- for text styled like placeholder but can't be selected with ::placeholder
    placeholder: "placeholder-gray-400",

    topMenuBorder: "border-b border-gray-200",
    topMenuScroll: "",
    headerShadow: "",
    navText: "text-gray-100",

    navMenu: "h-full relative",
    navMenuOpen: "bg-darkblue-500 text-white shadow-lg w-56 rounded-t-lg",
    navMenuBg: "bg-darkblue-500 bb-rounded-10 shadow-lg text-white rounded-b-lg",
    navMenuItem:
      "hover:font-medium cursor-pointer px-2 py-1 text-lg font-semibold",

    bg: "bg-gray-50",

    menuBg: "bg-white z-39",
    menuBgHover: "",
    menuBgActive: "bg-blue-200",
    menuBgActiveHover: "hover:bg-blue-300",
    menuText: "text-gray-100",
    menuTextHover: "hover:text-gray-700",
    menuTextActive: "text-blue-500",
    menuTextActiveHover: "hover:text-blue-700",

    headerBg: "bg-gray-200",
    headerBgHover: "hover:bg-gray-400",

    inputBg: "bg-white disabled:bg-gray-200 cursor-pointer focus:outline-none",
    inputBorder:
      "rounded border-0 border-transparent hover:border-gray-300 focus:border-gray-600 disabled:border-gray-200",
    inputBgDisabled: "bg-gray-200 cursor-not-allowed focus:outline-none",
    inputBorderDisabled: "rounded border-2 border-gray-200 hover:border-gray-200",
    inputBgFocus: "bg-white cursor-pointer focus:outline-none",
    inputBorderFocus:
      "rounded border-2 border-transparent hover:border-gray-600 focus:border-gray-600 border-gray-600",

    textBase: "text-base",
    textSmall: "text-sm",
    textLarge: "text-lg",
    paddingBase: "py-1 px-2",
    paddingSmall: "py-0 px-1",
    paddingLarge: "py-2 px-4",

    contentBg: "bg-white",

    accent1: "bg-blue-100",
    accent2: "bg-gray-300",
    accent3: "bg-gray-400",
    accent4: "bg-gray-500",

    highlight1: "bg-blue-200",
    highlight2: "bg-blue-300",
    highlight3: "bg-blue-400",
    highlight4: "bg-blue-500",

    width: "",

    transition: "transition ease-in-out duration-150",
    button: `
        inline-flex items-center
        px-4 py-2 border border-gray-300
        text-sm leading-5 font-medium
        rounded-md text-gray-700 bg-white
        hover:text-gray-500
        focus:outline-none focus:shadow-outline-blue focus:border-blue-300
        active:text-gray-800 active:bg-gray-50 transition duration-150 ease-in-out
        disabled:cursor-not-allowed`,
    buttonPrimary:
      "inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700 transition duration-150 ease-in-out disabled:cursor-not-allowed",

    tableRow: "bg-gray-100 hover:bg-gray-200 transition ease-in-out duration-150",
    tableRowStriped:
      "bg-gray-100 even:bg-gray-200 hover:bg-gray-300 transition ease-in-out duration-150",

    tableCell: "px-4 py-1 whitespace-no-wrap",

    tableHeader:
      "px-4 py-2 pb-1 border-b-2 border-gray-300 bg-gray-200 text-left font-medium text-gray-700 uppercase first:rounded-tl-md last:rounded-tr-md",
  }
};

const PPDAF_THEME = ppdaf();
export default PPDAF_THEME
// import { Compositions, composeTheme } from "@availabs/avl-components";

// const { $compositions } = Compositions;

// $compositions.button[1]["$default"] = "text-blueGray-200 disabled:text-blueGray-300";
// $compositions.button[2]["$default"] = "border-blueGray-200";
// $compositions.button[3]["$default"] = "hover:bg-blueGray-200 hover:text-blueGray-900";

// $compositions.button[1]["Dark"] = "bg-blueGray-900 text-current disabled:text-gray-300";
// $compositions.button[2]["Dark"] = "border-blueGray-900";
// $compositions.button[3]["Dark"] = "hover:bg-blueGray-800 hover:border-blueGray-800";
// $compositions.button[4]["Wide"] = "px-6 py-0 @textSmall";

// //console.log("$compositions",$compositions)

// // import {composeTheme} from "@availabs/avl-components/dist/Themes/utils";

// const colors = {
//   transparent: {
//     contentBg: "",
//     accentColor: "blue-600",
//     accentBg: "hover:bg-blue-600",
//     borderColor: "border-gray-200",
//     textColor: "text-gray-800",
//     highlightColor: "text-white",
//   },
//   white: {
//     contentBg: "bg-white",
//     accentColor: "blue-600",
//     accentBg: "hover:bg-blue-600",
//     borderColor: "border-gray-100",
//     textColor: "text-gray-600",
//     highlightColor: "text-white",
//   },
//   dark: {
//     contentBg: "bg-darkblue-600",
//     accentColor: "blue-600",
//     accentBg: "hover:bg-blue-600",
//     borderColor: "border-gray-700",
//     textColor: "text-gray-200",
//     highlightColor: "text-white",
//   },
//   gray: {
//     contentBg: "bg-gray-800",
//     accentColor: "gray-500",
//     accentBg: "hover:bg-gray-500",
//     borderColor: "border-gray-600",
//     textColor: "text-gray-300",
//     highlightColor: "text-gray-200",
//   },
//   bright: {
//     contentBg: "bg-blue-700",
//     accentColor: "blue-400",
//     accentBg: "hover:bg-blue-400",
//     borderColor: "border-blue-600",
//     textColor: "text-white",
//     highlightColor: "text-white",
//   },
// };

// const sizes = {
//   compact: {
//     wrapper: "w-64",
//     sideItem: "flex mx-6 pr-4 py-2 text-sm font-light hover:pl-4",
//     topItem: "flex items-center text-sm px-4 border-r h-12",
//     icon: "mr-3 text-lg",
//   },
//   full: {
//     wrapper: "w-64",
//     sideItem: "flex mx-4 pr-4 py-4 text-base font-base border-b hover:pl-4",
//     topItem: "flex pr-4 py-2 text-sm font-light",
//     icon: "mr-4 text-2xl",
//   },
//   mini: {
//     wrapper: "w-20 overflow-x-hidden",
//     sideItem: "flex pr-4 py-4 text-base font-base border-b",
//     topItem: "flex px-4 items-center text-sm font-light ",
//     icon: "w-20 mr-4 text-4xl",
//   },
//   micro: {
//     wrapper: "w-14 overflow-x-hidden",
//     sideItem: "flex pr-4 py-4 text-base font-base border-b",
//     topItem: "flex mx-6 pr-4 py-2 text-sm font-light",
//     icon: "w-14 mr-4 text-2xl",
//   },
// };

// let color = "white";
// let size = "compact";



// const TDS_THEME_BASE = {
//     /* -----
//      Side Nav Theme Components Minimal
//   ------*/

//   sidenavWrapper: `${colors[color].contentBg} ${sizes[size].wrapper} border-r border-gray-200 h-full`,
//   menuIconSide: ` text-${colors[color].accentColor} ${sizes[size].icon} group-hover:${colors[color].highlightColor}`,
//   navitemSide: `
//     group font-sans
//     ${sizes[size].sideItem} ${colors[color].textColor} ${colors[color].borderColor}
//     ${colors[color].accentBg} hover:${colors[color].highlightColor}
//     focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300
//     transition-all cursor-pointer
//   `,

//   navitemSideActive: `
//     group flex pl-8 pr-4 py-2 bg-${colors[color].highlightColor} text-base font-medium text-darkblue-500 focus:outline-none hover:text-indigo-800 focus:text-indigo-800 focus:bg-blue-200 focus:border-indigo-700 transition duration-150 ease-in-out`,

//   /* -----
//      Top Nav Theme Components Minimal
//   ------*/
//   topnavWrapper: `w-full h-12 ${colors[color].contentBg}`,
//   topnavContent: `flex w-full h-full`,
//   topnavMenu: `hidden md:flex flex-1 h-full overflow-x-auto overflow-y-hidden scrollbar-sm`,
//   menuIconTop: `text-${colors[color].accentColor} ${sizes[size].icon} group-hover:${colors[color].highlightColor}`,

//   navitemTop: `
//     group font-sans w-full
//     ${sizes[size].topItem} ${colors[color].textColor} ${colors[color].borderColor}
//     ${colors[color].accentBg} hover:${colors[color].highlightColor}
//     focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300
//     transition cursor-pointer`,
//   //`px-4 text-sm font-medium tracking-widest uppercase inline-flex items-center  border-transparent  leading-5 text-white hover:bg-white hover:text-darkblue-500 border-gray-200 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out h-full`,
//   topmenuRightNavContainer: "hidden md:block h-full",
//   navitemTopActive: `group font-sans w-full
//     ${sizes[size].topItem} ${colors[color].textColor} ${colors[color].borderColor}
//     ${colors[color].accentBg} hover:${colors[color].highlightColor}
//     focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300
//     transition cursor-pointer`,

//   /* ------------------------- */

//   text: 'text-black-100',
//   textContrast: "text-white",
//   border: "border-blueGray-100",



//   textInfo: "text-cyan-300",
//   bgInfo: "bg-cyan-400",
//   borderInfo: "border-cyan-400",

//   textSuccess: "text-green-400",
//   bgSuccess: "bg-green-400",
//   borderSuccess: "border-green-400",

//   textDanger: "text-red-400",
//   bgDanger: "bg-red-400",
//   borderDanger: "border-red-400",

//   textWarning: "text-yellow-400",
//   bgWarning: "bg-yellow-400",
//   borderWarning: "border-yellow-400",

//   textLight: "text-blueGray-300", // <-- for text styled like placeholder but can't be selected with ::placeholder
//   // these 2 should be equal
//   placeholder: 'placeholder-blueGray-300',

//   menuIcon: 'mr-3 h-6 w-6',
//   topMenuBorder: 'border-b border-blueGray-800',
//   headerShadow: '',

//   bg: 'bg-white',

//   menuBg: 'bg-white',
//   menuBgHover: 'hover:bg-blueGray-600',
//   menuBgActive: 'bg-white',
//   menuBgActiveHover: 'hover:bg-blue-500',
//   menuText : "text-gray-700",
//   menuTextHover: "hover:text-cyan-300",
//   menuTextActive: "text-cyan-300",
//   menuTextActiveHover: "hover:text-cyan-200",


//   sidebarBg: 'bg-white',
//   sidebarBorder: '',

//   headerBg: 'bg-blueGray-900',
//   headerBgHover: "hover:bg-blueGray-700",

//   inputBg: "bg-white disabled:bg-gray-300 cursor-pointer focus:outline-none",
//   inputBorder: "border border-gray-300 hover:border-blueGray-400 focus:border-blueGray-300 disabled:border-transparent",
//   inputBgDisabled: "bg-blueGray-300 cursor-not-allowed focus:outline-none",
//   inputBorderDisabled: "rounded border border-blueGray-400 hover:border-blueGray-400",
//   inputBgFocus: "bg-blue-200 cursor-pointer focus:outline-none",
//   inputBorderFocus: "rounded border hover:border-blueGray-300 focus:border-blueGray-300 border-blueGray-300",

//   textBase: "text-base",
//   textSmall: "text-sm",
//   textLarge: "text-lg",
//   paddingBase: "py-1 px-2",
//   paddingSmall: "py-0 px-1",
//   paddingLarge: "py-2 px-4",

//   accent1: 'bg-white',
//   accent2: 'bg-blue-200',
//   accent3: 'bg-white',
//   accent4: 'bg-gray-400',

//   highlight1: "bg-cyan-400",
//   highlight2: "bg-cyan-300",
//   highlight3: "bg-cyan-200",
//   highlight4: "bg-cyan-100",

//   contentBg: 'bg-white',
//   contentWidth: 'w-full max-w-7xl',
//   contentPadding: "py-8",

//   sidebarW: '56',
//   transition: "transition ease-in-out duration-150",

//   tableInfoBar: "bg-white border-2 border-gray-300",
//   tableRow: 'bg-white hover:bg-gray-200 @transition',
//   tableRowStriped: 'odd:bg-white even:bg-gray-200 hover:bg-gray-200 @transition',

//   tableCell: 'px-4 py-1 whitespace-no-wrap border-2 border-gray-300',

//   tableHeader: "px-4 py-2 pb-1 border-2 border-gray-300 text-left text-black font-medium uppercase first:rounded-tl-md last:rounded-tr-md",

//   $compositions
// }
// const TDS_THEME = composeTheme(TDS_THEME_BASE);

// export default TDS_THEME;