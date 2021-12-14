import React from "react"

import { Select, useTheme,/*CollapsibleSidebar*/ } from "@availabs/avl-components"



const Download = ({ inactiveLayers, activeLayers, MapActions, ...rest }) => {

  const theme = useTheme();

  const download = (url) => {
    fetch(url)
      .then(r => {
        console.log('response ', r)
         return r.json()
      })
      .then(d => {
        console.log('Download', d)
      } )
  }

  return (
    <>
      
      <h4>Download</h4>
      { activeLayers.map(layer =>
          <div key={layer.name}>
            <div className='cursor-pointer' onClick={e => download(`https://tig.nymtc.org/views/${layer.viewId}/export_shp`)}>
            {layer.name}
            </div>
          </div>
        )
      }
    </>
  )
}

export default Download