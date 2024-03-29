import React, {useMemo, useEffect, useState} from "react"
import { AvlMap } from "../../components/avl-map/src"
import config from "config.json"
import { withAuth, useFalcor } from 'components/avl-components/src'
import {layers} from "./layers";
import {useParams} from 'react-router-dom'
import get from 'lodash.get'
import TigLayout from 'components/tig/TigLayout'

import LegendComp from './components/LegendSidebar'
import AddLayersComp from './components/AddLayers'
import Download from './components/Download'
import Attribution from './components/Attribution'

const Map = withAuth(({ mapOptions,layers,views}) => {
    const {falcor, falcorCache} = useFalcor();
    const [layer, setLayer] = useState([]);
    const {viewId} = useParams();

    useEffect(() => {
        falcor.get([ "tig", "byViewId", viewId, 'layer'])
    }, [viewId, falcor])

    useEffect(() => {
        let allLayers = Object.keys(layers).map(l => {
            return layers[l]({name: l, type:l, vid: viewId, setActive: false})
        }) 
        setLayer(allLayers)

    },[layers, viewId]) // only run on first load

    useMemo(() => {
        let l = get(falcorCache, [ "tig", "byViewId", viewId, 'layer', 'value'], null)
        
        if(l) {
           let viewLayer = layer.filter(d => d.type === l)
           //console.log('got the viewLayer', viewLayer)
           if(viewLayer[0]) {
            viewLayer[0].setActive = true;
           }
        }
    }, [viewId, falcorCache, layer])

    return (
        <TigLayout >
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
    layout: 'Simple',
    exact: true,
    // authLevel: 0,
     component: {
        type: Map,
        props: {
            mapOptions: {
                zoom: 7.27,
                center: [-73.496258, 40.892292],
                styles: [
                {
                        name: "Topographic",
                        style: 'mapbox://styles/am3081/ckidwyrw22uak19pboub25qix'
                    },
                    {name: "Streets",
                    style: 'mapbox://styles/am3081/ckt3271or0nnu17oikkvl0eme' },
                    
                    {name: "Satellite",
                    style: 'mapbox://styles/am3081/cjya6wla3011q1ct52qjcatxg' },
                     {name: "Satellite Streets",
                    style: 'mapbox://styles/am3081/cjya70364016g1cpmbetipc8u' },
                    {name: "Light",
                    style: 'mapbox://styles/am3081/ckm86j4bw11tj18o5zf8y9pou' },
                    {name: "Dark",
                    style: 'mapbox://styles/am3081/ckm85o7hq6d8817nr0y6ute5v' }
                    ]
            },
            layers: layers
            
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
