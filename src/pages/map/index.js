import React,{useMemo} from "react"
import { AvlMap } from "../../components/avl-map/src"
import config from "config.json"
import { withAuth } from '@availabs/avl-components'
import {layers} from "./layers";
import {useParams} from 'react-router-dom'
import routingConfig from './routing-config/routingConfig.json'

import TigLayout from 'components/tig/TigLayout'

const testComp = () => {
    return (<div>hello</div>)
}

const LegendComp = ({activeLayers, ...props}) => {
    return (<div className='my-4 bg-white w-full'></div>)
}

const Map = withAuth(({ mapOptions,layers,views}) => {
    const {viewId} = useParams()

    const layer = useMemo(() => {
        let layerVal = routingConfig.reduce((a, c) => {
            if (c.value === viewId) {
                a = [layers[0][c.layer]({name:c.name,viewId:viewId})]
            }
            return a
        }, '')
        console.log('layerVal', layerVal)
        return layerVal
    }, [viewId,layers])


    return (
        <TigLayout>
            <div className='w-full h-full' style={{height: '800px'}}>   
                <AvlMap
                    accessToken={ config.MAPBOX_TOKEN }
                    mapOptions={ mapOptions }
                    layers={layer}
                    sidebarTabPosition='side'
                    sidebar={{
                        title: "",
                        tabs: [
                            {
                                icon: "fa fa-bars",
                                Component: LegendComp
                            },
                            "layers", 
                            "styles",
                            {
                                icon: "fa fa-plus",
                                Component: testComp
                            },
                            {
                                icon: "fa fa-download",
                                Component: testComp
                            },
                            {
                                icon: "fa fa-info-circle",
                                Component: testComp
                            },
                        ],
                        open: false

                    }}

                />
               
            </div>
        </TigLayout>
    )
})


const MapPage = {
    path: `/views/:viewId/map`,
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
                zoom: 8.5,
                center: [-73.911895, 40.88],
                styles: [
                    {name: "Streets",
                    style: 'mapbox://styles/am3081/ckt3271or0nnu17oikkvl0eme' },
                    {name: "Light",
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
