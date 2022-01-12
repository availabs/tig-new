import React from "react"

import { Select, useTheme,/*CollapsibleSidebar*/ } from "@availabs/avl-components"



const LayersTab = ({ inactiveLayers, activeLayers, MapActions, ...rest }) => {

  const theme = useTheme();

  return (
    <>
      { !inactiveLayers.length ? null :
        <div className={ `mb-1 p-1 ${ theme.menuBg } ${theme.rounded}` }>
          <div className={ `p-1 ${ theme.bg } ${theme.rounded}` }>
            <Select options={ inactiveLayers }
              placeholder="Add a Layer..."
              accessor={ ({ name }) => name }
              value={ null } multi={ false }
              searchable={ false }
              onChange={ MapActions.addLayer }/>
          </div>
        </div>
      }
      <h4>Active Layers</h4>
      { activeLayers.map((layer,i) =>
          <div key={i}>
            {layer.name}
          </div>
        )
      }
    </>
  )
}

export default LayersTab