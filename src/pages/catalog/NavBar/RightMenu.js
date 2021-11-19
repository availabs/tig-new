import React from "react"

import { NavItem} from '@availabs/avl-components'

export const RightMenu = ()=> {
    return (
        <div className="h-full flex py-2">
            <NavItem to="/" type='top' customTheme={{
                sidebarBg: 'bg-gray-800',
                topNavHeight: '12' ,
                navitemTop: 'px-8 inline-flex items-center text-base font-normal text-white hover:text-gray-100 hover:pb-4 focus:outline-none  focus:border-gray-300 transition duration-150 ease-in-out',
                navitemTopActive: 'px-8 inline-flex items-center text-base font-normal text-white hover:text-indigo-500 hover:pb-4 focus:outline-none  focus:border-gray-300 transition duration-100 ease-in-out'
            }}>Welcome</NavItem>
            {/*<NavMenu>
                <NavMenuItem to="/" className="text-white">
                    Logout
                </NavMenuItem>
            </NavMenu>*/}
        </div>
    )
}


