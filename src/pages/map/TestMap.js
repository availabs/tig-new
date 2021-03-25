import React, {useState,useEffect,useRef} from "react"

import { HOST } from './layerHost'

import { AvlMap } from "@availabs/avl-map"

import config from "config.json"

import { withAuth } from '@availabs/avl-components'


import { PublicNav } from 'pages/Landing'

const Map = withAuth(({ mapOptions, layers, falcor, user }) => {

    const [data,setData] = useState({})

    useEffect(() => {
        let isCancelled = false;
        fetch(`${HOST}views/49/data_overlay`)
              .then(response => response.json())
               .then(response => {
                 if (!isCancelled) {
                   setData(response)
                 }
               })
               .catch(err => {
                 setData({})
                 console.error(err)
               });
            return () => {
                isCancelled = true;
            };
          }, []);


    console.log(data)

    return (
            <div className='h-screen  h-full flex-1 flex flex-col text-white'>
                {user && user.authLevel > 0 ? <React.Fragment/> : <PublicNav />}
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
  path: "/map",
  mainNav: false,
  name: "Traffic Data Map",
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
