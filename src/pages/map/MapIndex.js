import React from "react"
import { AvlMap } from "components/avl-map/src"
import config from "config.json"
import TigLayout from 'components/tig/TigLayout'
import {layers} from "./layers";

//import { MacroLayerFactory } from "./layers/NP/index"

const Map = ({ mapOptions,layers}) => {


    return (
        <TigLayout>
            <div className='w-full h-[918px]' style={{height: 900}}>
                <div className='w-full h-full'>
                    <AvlMap
                        accessToken={ config.MAPBOX_TOKEN }
                        mapOptions={ mapOptions }
                        layers={ [] }
                        sidebar={{
                            title: "Map Test",
                            tabs: ["layers", "styles"],
                            open: true

                        }}
                    />
                </div>
            </div>
        </TigLayout>
    )
}



const MapPage = {
    path: "/map",
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
                layers.rtp_project_data(),
                // layers.hub_bound_travel_data(),
                // layers.bpm_performance(),
                // layers.acs_census(),
                // layers.sed_taz_2055(),
                // layers.sed_county_2055(),
                // layers.sed_taz_2040(),
                // layers.sed_county_2040(),
                // layers.sed_county_2050(),
                // layers.tig()

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
