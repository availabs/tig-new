import { Compositions, composeTheme } from "@availabs/avl-components";

const { $compositions } = Compositions;

$compositions.button[1]["$default"] = "text-blueGray-200 disabled:text-blueGray-300";
$compositions.button[2]["$default"] = "border-blueGray-200";
$compositions.button[3]["$default"] = "hover:bg-blueGray-200 hover:text-blueGray-900";

$compositions.button[1]["Dark"] = "bg-blueGray-900 text-current disabled:text-gray-300";
$compositions.button[2]["Dark"] = "border-blueGray-900";
$compositions.button[3]["Dark"] = "hover:bg-blueGray-800 hover:border-blueGray-800";
$compositions.button[4]["Wide"] = "px-6 py-0 @textSmall";

//console.log("$compositions",$compositions)

// import {composeTheme} from "@availabs/avl-components/dist/Themes/utils";

const colors = {
  transparent: {
    contentBg: "",
    accentColor: "blue-600",
    accentBg: "hover:bg-blue-600",
    borderColor: "border-gray-200",
    textColor: "text-gray-800",
    highlightColor: "text-white",
  },
  white: {
    contentBg: "bg-white",
    accentColor: "blue-600",
    accentBg: "hover:bg-blue-600",
    borderColor: "border-gray-100",
    textColor: "text-gray-600",
    highlightColor: "text-white",
  },
  dark: {
    contentBg: "bg-darkblue-600",
    accentColor: "blue-600",
    accentBg: "hover:bg-blue-600",
    borderColor: "border-gray-700",
    textColor: "text-gray-200",
    highlightColor: "text-white",
  },
  gray: {
    contentBg: "bg-gray-800",
    accentColor: "gray-500",
    accentBg: "hover:bg-gray-500",
    borderColor: "border-gray-600",
    textColor: "text-gray-300",
    highlightColor: "text-gray-200",
  },
  bright: {
    contentBg: "bg-blue-700",
    accentColor: "blue-400",
    accentBg: "hover:bg-blue-400",
    borderColor: "border-blue-600",
    textColor: "text-white",
    highlightColor: "text-white",
  },
};

const sizes = {
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
  mini: {
    wrapper: "w-20 overflow-x-hidden",
    sideItem: "flex pr-4 py-4 text-base font-base border-b",
    topItem: "flex px-4 items-center text-sm font-light ",
    icon: "w-20 mr-4 text-4xl",
  },
  micro: {
    wrapper: "w-14 overflow-x-hidden",
    sideItem: "flex pr-4 py-4 text-base font-base border-b",
    topItem: "flex mx-6 pr-4 py-2 text-sm font-light",
    icon: "w-14 mr-4 text-2xl",
  },
};

let color = "white";
let size = "compact";



const TDS_THEME_BASE = {
    /* ----- 
     Side Nav Theme Components Minimal 
  ------*/

  sidenavWrapper: `${colors[color].contentBg} ${sizes[size].wrapper} border-r border-gray-200 h-full`,
  menuIconSide: ` text-${colors[color].accentColor} ${sizes[size].icon} group-hover:${colors[color].highlightColor}`,
  navitemSide: ` 
    group font-sans 
    ${sizes[size].sideItem} ${colors[color].textColor} ${colors[color].borderColor} 
    ${colors[color].accentBg} hover:${colors[color].highlightColor} 
    focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
    transition-all cursor-pointer
  `,

  navitemSideActive: `
    group flex pl-8 pr-4 py-2 bg-${colors[color].highlightColor} text-base font-medium text-darkblue-500 focus:outline-none hover:text-indigo-800 focus:text-indigo-800 focus:bg-blue-200 focus:border-indigo-700 transition duration-150 ease-in-out`,

  /* ----- 
     Top Nav Theme Components Minimal 
  ------*/
  topnavWrapper: `w-full h-12 ${colors[color].contentBg}`,
  topnavContent: `flex w-full h-full`,
  topnavMenu: `hidden md:flex flex-1 h-full overflow-x-auto overflow-y-hidden scrollbar-sm`,
  menuIconTop: `text-${colors[color].accentColor} ${sizes[size].icon} group-hover:${colors[color].highlightColor}`,

  navitemTop: `
    group font-sans w-full
    ${sizes[size].topItem} ${colors[color].textColor} ${colors[color].borderColor} 
    ${colors[color].accentBg} hover:${colors[color].highlightColor} 
    focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
    transition cursor-pointer`,
  //`px-4 text-sm font-medium tracking-widest uppercase inline-flex items-center  border-transparent  leading-5 text-white hover:bg-white hover:text-darkblue-500 border-gray-200 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out h-full`,
  topmenuRightNavContainer: "hidden md:block h-full",
  navitemTopActive: `group font-sans w-full
    ${sizes[size].topItem} ${colors[color].textColor} ${colors[color].borderColor} 
    ${colors[color].accentBg} hover:${colors[color].highlightColor} 
    focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 
    transition cursor-pointer`,

  /* ------------------------- */

  text: 'text-blueGray-100',
  textContrast: "text-white",
  border: "border-blueGray-100",



  textInfo: "text-cyan-400",
  bgInfo: "bg-cyan-400",
  borderInfo: "border-cyan-400",

  textSuccess: "text-green-400",
  bgSuccess: "bg-green-400",
  borderSuccess: "border-green-400",

  textDanger: "text-red-400",
  bgDanger: "bg-red-400",
  borderDanger: "border-red-400",

  textWarning: "text-yellow-400",
  bgWarning: "bg-yellow-400",
  borderWarning: "border-yellow-400",

  textLight: "text-blueGray-300", // <-- for text styled like placeholder but can't be selected with ::placeholder
  // these 2 should be equal
  placeholder: 'placeholder-blueGray-300',

  menuIcon: 'mr-3 h-6 w-6',
  topMenuBorder: 'border-b border-blueGray-800',
  headerShadow: '',

  bg: 'bg-white',

  menuBg: 'bg-white',
  menuBgHover: 'hover:bg-blueGray-600',
  menuBgActive: 'bg-blueGray-700',
  menuBgActiveHover: 'hover:bg-blueGray-600',
  menuText : "text-blueGray-100",
  menuTextHover: "hover:text-cyan-300",
  menuTextActive: "text-cyan-300",
  menuTextActiveHover: "hover:text-cyan-200",

  
  sidebarBg: 'bg-white',
  sidebarBorder: '',

  headerBg: 'bg-blueGray-900',
  headerBgHover: "hover:bg-blueGray-700",

  inputBg: "bg-white disabled:bg-gray-300 cursor-pointer focus:outline-none",
  inputBorder: "rounded border border-transparent hover:border-blueGray-400 focus:border-blueGray-300 disabled:border-transparent",
  inputBgDisabled: "bg-blueGray-300 cursor-not-allowed focus:outline-none",
  inputBorderDisabled: "rounded border border-blueGray-400 hover:border-blueGray-400",
  inputBgFocus: "bg-blue-200 cursor-pointer focus:outline-none",
  inputBorderFocus: "rounded border hover:border-blueGray-300 focus:border-blueGray-300 border-blueGray-300",

  textBase: "text-base",
  textSmall: "text-sm",
  textLarge: "text-lg",
  paddingBase: "py-1 px-2",
  paddingSmall: "py-0 px-1",
  paddingLarge: "py-2 px-4",

  accent1: 'bg-gray-600',
  accent2: 'bg-gray-500',
  accent3: 'bg-gray-400',
  accent4: 'bg-gray-300',

  highlight1: "bg-cyan-400",
  highlight2: "bg-cyan-300",
  highlight3: "bg-cyan-200",
  highlight4: "bg-cyan-100",

  contentBg: 'bg-white',
  contentWidth: 'w-full max-w-7xl',
  contentPadding: "py-8",

  sidebarW: '56',
  transition: "transition ease-in-out duration-150",

  tableInfoBar: "bg-blueGray-700",
  tableRow: 'bg-blueGray-800 hover:bg-blueGray-600 @transition',
  tableRowStriped: 'bg-blueGray-800 even:bg-blueGray-700 hover:bg-blueGray-600 @transition',

  tableCell: 'px-4 py-1 whitespace-no-wrap',

  tableHeader: "px-4 py-2 pb-1 border-b-2 border-blueGray-900 bg-blueGray-900 text-left font-medium @text uppercase first:rounded-tl-md last:rounded-tr-md",

  $compositions
}
const TDS_THEME = composeTheme(TDS_THEME_BASE);

export default TDS_THEME;