import React,{useMemo} from "react"
import { AvlMap } from "@availabs/avl-map"
import config from "config.json"
import { withAuth } from '@availabs/avl-components'
import {layers} from "./layers";
import {useParams} from 'react-router-dom'
import routingConfig from './routing-config/routingConfig.json'

const Map = withAuth(({ mapOptions,layers,views}) => {
    const {viewId} = useParams()

    const layer = useMemo(() => {
        return routingConfig.reduce((a, c) => {
            if (c.value === viewId) {
                a = [layers[0][c.layer]({name:c.name,viewId:viewId})]
            }
            return a
        }, '')
    }, [viewId,layers])


    return (
        <div className='h-screen  h-full flex-1 flex flex-col text-white'>

            <AvlMap
                accessToken={ config.MAPBOX_TOKEN }
                mapOptions={ mapOptions }
                layers={layer}
                sidebar={{
                    title: "Map Test",
                    tabs: ["layers", "styles"],
                    open: true

                }}

            />
        </div>
    )
})



const MapPage = {
    path: "/views/:viewId/map",
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
                zoom: 6.6,
                styles: [{name: "Light",
                    style: 'mapbox://styles/am3081/ckm86j4bw11tj18o5zf8y9pou' }]
            },
            layers: [
               layers
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
