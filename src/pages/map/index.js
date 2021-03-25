import React from "react"

import { AvlMap } from "@availabs/avl-map"

import config from "config.json"

// import { TestCountyLayerFactory } from "./layers/TestCountyLayer"
// import { TestCousubLayerFactory } from "./layers/TestCousubLayer"

const Map = ({ mapOptions, layers, falcor }) => {

  return (
    <AvlMap 
      accessToken={ config.MAPBOX_TOKEN }
      mapOptions={ mapOptions }
      layers={ layers }
      sidebar={ {
        title: "Map Test",
        tabs: ["layers", "styles",
          { icon: "fa-cog",
            Component: CustomTab
          }
        ]
      } }/>
  )
}

const CustomTab = props => {
  return (
    <div className={ `bg-blueGray-800 p-1 rounded` }>
      <div className={ `bg-blueGray-700 p-1 rounded` }>
        SOME STUFF HERE!!!!
      </div>
    </div>
  )
}

const MapPage = {
  path: "/maptest",
  mainNav: false,
  name: "Map Test",
  exact: true,
  // authLevel: 0,
  layoutSettings: {
    fixed: true,
    navBar: 'top',
    headerBar: false
  },
  component: {
    type: Map,
    props: {
      mapOptions: {
        zoom: 9
      },
      layers: [
        // TestCousubLayerFactory(),
        // TestCountyLayerFactory()
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
