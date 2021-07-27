import {TopNav} from "@availabs/avl-components";
import {Link} from "react-router-dom";
import {RightMenu} from "./RightMenu";
import React from "react";
import logo from './logo/img.jpg'

const navItems = [
    {
      name: 'TIG Data Map',
      path: `/map/`,
      icon: 'fa fa-map',
      className: 'font-medium text-lg'

    },
    // {
    //     name: 'Traffic Stats',
    //     path: `/short/`,
    //     icon: 'fa fa-edit',
    //     className: 'font-medium text-lg'
    // },
    // {
    //     name: 'Documentation',
    //     path: `/docs/`,
    //     //icon: 'fa fa-edit',
    //     className: 'font-medium text-lg'
    // }
]

export const PublicNav = () =>
    <TopNav
        menuItems={navItems}
        open={true}
        logo={<div className="mr-8">
            <Link to="/">
                <img  className="w-auto sm:h-14" src={logo} alt='Logo' height="300" width="200"/>
            </Link>
        </div>

        }
        rightMenu={<RightMenu/>}
        customTheme={{
            sidebarBg: 'bg-gray-800',
            topNavHeight: '12' ,
            navitemTop: 'px-8 inline-flex items-center text-base font-normal  text-white hover:text-indigo-500 hover:pb-4 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out',
            navitemTopActive: 'px-8 inline-flex items-center text-base font-normal text-white hover:text-indigo-500 hover:pb-4 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out'
        }}
    />
