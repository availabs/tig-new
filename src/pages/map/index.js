import React,{useMemo} from "react"
import { AvlMap } from "../../components/avl-map/src"
import config from "config.json"
import { withAuth } from '@availabs/avl-components'
import {layers} from "./layers";
import {useParams} from 'react-router-dom'
import routingConfig from './routing-config/routingConfig.json'

import TigLayout from 'components/tig/TigLayout'

import LegendComp from './components/LegendSidebar'
import AddLayersComp from './components/AddLayers'
import Download from './components/Download'
import Attribution from './components/Attribution'

const testComp = () => {
    return (<div>hello</div>)
}



const Map = withAuth(({ mapOptions,layers,views}) => {
    const {viewId} = useParams()

    let activelayers = []
    const layer = useMemo(() => {
        let layerVal = routingConfig.reduce((a, c) => {
            if (c.value === viewId) {
                a.push(layers[0][c.layer]({name:c.name, viewId:viewId, setActive: true}))
                activelayers.push(c.layer)
            }
            else if (!activelayers.includes(c.layer)) {
                a.push(layers[0][c.layer]({name:c.name, setActive: false}))
                activelayers.push(c.layer)
            }
            
            return a
        }, [])
        //console.log('layerVal', layerVal)
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
                    navigationControl="bottom-right"
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
                                Component: AddLayersComp
                            },
                            {
                                icon: "fa fa-download",
                                Component: Download
                            },
                            {
                                icon: "fa fa-info-circle",
                                Component: Attribution
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
                    {
                        name: "Topgraphic",
                        style: 'mapbox://styles/am3081/ckidwyrw22uak19pboub25qix'
                    },
                     {name: "Sattelite",
                    style: 'mapbox://styles/am3081/cjya6wla3011q1ct52qjcatxg' },
                     {name: "Sattelite Streets",
                    style: 'mapbox://styles/am3081/cjya70364016g1cpmbetipc8u' },
                    {name: "Light",
                    style: 'mapbox://styles/am3081/ckm86j4bw11tj18o5zf8y9pou' },
                    {name: "Dark",
                    style: 'mapbox://styles/am3081/ckm85o7hq6d8817nr0y6ute5v' }
                    ]
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
