import React from "react"

import get from "lodash.get"

import { AvlMap } from "@availabs/avl-map"

import config from "config.json"

import { withAuth } from '@availabs/avl-components'

import layer from "../../layers/index";


const Map = withAuth(({ mapOptions, layers, falcor, user }) => {

    return (
        <div className='h-screen  h-full flex-1 flex flex-col text-white'>
            <AvlMap
                accessToken={ config.MAPBOX_TOKEN }
                mapOptions={ mapOptions }
                layers={ layers }
                sidebar={{
                    title: "Map Test",
                    tabs: ["layers", "styles"],
                    open: false
                }}/>
        </div>
    )
})



const MapPage = {
    path: "/maptest",
    mainNav: false,
    name: "TIG Map",
    exact: true,
    // authLevel: 0,
    layout: 'Simple',
    layoutSettings: {
        fixed: true,
        navBar: 'top',
        headerBar: false
    },
    component: {
        type: Map,
        props: {
            mapOptions: {
                zoom: 6.6
            },
            layers: [

            ]
        },
        wrappers: [
            "avl-falcor"
        ]
    }
}


const routes = [
    MapPage
];
export default routes;
