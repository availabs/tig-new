import React from "react"

import { Select, useTheme,/*CollapsibleSidebar*/ } from "@availabs/avl-components"



const Attribution = ({ inactiveLayers, activeLayers, MapActions, ...rest }) => {

  const theme = useTheme();

 
  return (
    <>
      
      <h4>Attribution</h4>
      { activeLayers.map(layer =>
          <div key={layer.name}>
            <div className={'pb-2'}>
            {layer.name}
            </div>
            {layer.attribution}
          </div>
        )
      }
    </>
  )
}

export default Attribution