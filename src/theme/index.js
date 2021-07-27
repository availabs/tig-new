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

const TDS_THEME_BASE = {
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

	menuBg: 'bg-blueGray-800',
	menuBgHover: 'hover:bg-blueGray-600',
	menuBgActive: 'bg-blueGray-700',
	menuBgActiveHover: 'hover:bg-blueGray-600',
	menuText : "text-blueGray-100",
	menuTextHover: "hover:text-cyan-300",
	menuTextActive: "text-cyan-300",
	menuTextActiveHover: "hover:text-cyan-200",

	topNavHeight: '14',
	navMenuItem: 'hover:font-medium cursor-pointer px-1	py-1 text-lg font-semibold',
	navitemTop: 'px-4 text-sm font-medium tracking-widest uppercase inline-flex items-center  border-transparent  leading-5 text-white hover:text-gray-600 hover:text-darkblue-500 border-gray-200 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out h-full',
	navitemTopActive: 'px-4 text-sm font-medium tracking-widest uppercase inline-flex items-center leading-5 text-darkblue-500 bg-white focus:outline-none  focus:border-indigo-700 transition duration-150 ease-in-out',
	scrollBar: 'overflow-auto scrollbar-xsm scrollbar-sm',
	navMenu: 'h-full relative',
	navMenuOpen: 'bg-darkblue-500 text-white shadow-lg w-56 rounded-t-lg',
	navMenuBg: 'bg-darkblue-500 bb-rounded-10 shadow-lg text-white rounded-b-lg',
	navitemSideChildContainer: 'pl-4',
	navitemSide: 'font-sans group flex pl-8 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:text-blue-600 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out',
	navitemSideActive: 'group flex pl-8 pr-4 py-2 bg-white text-base font-medium text-darkblue-500 focus:outline-none hover:text-indigo-800 focus:text-indigo-800 focus:bg-blue-200 focus:border-indigo-700 transition duration-150 ease-in-out',

	sidebarBg: 'bg-blueGray-900',
	sidebarBorder: '',

	headerBg: 'bg-blueGray-900',
	headerBgHover: "hover:bg-blueGray-700",

	inputBg: "bg-blueGray-500 disabled:bg-blueGray-300 cursor-pointer focus:outline-none",
	inputBorder: "rounded border border-transparent hover:border-blueGray-400 focus:border-blueGray-300 disabled:border-transparent",
	inputBgDisabled: "bg-blueGray-300 cursor-not-allowed focus:outline-none",
	inputBorderDisabled: "rounded border border-blueGray-400 hover:border-blueGray-400",
	inputBgFocus: "bg-blueGray-500 cursor-pointer focus:outline-none",
	inputBorderFocus: "rounded border hover:border-blueGray-300 focus:border-blueGray-300 border-blueGray-300",

	textBase: "text-base",
	textSmall: "text-sm",
	textLarge: "text-lg",
	paddingBase: "py-1 px-2",
	paddingSmall: "py-0 px-1",
	paddingLarge: "py-2 px-4",

	accent1: 'bg-blueGray-600',
	accent2: 'bg-blueGray-500',
	accent3: 'bg-blueGray-400',
	accent4: 'bg-blueGray-300',

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
