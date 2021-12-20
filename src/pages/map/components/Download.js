import React from "react"

import { Select, useTheme,/*CollapsibleSidebar*/ } from "@availabs/avl-components"



const Download = ({ inactiveLayers, activeLayers, MapActions, ...rest }) => {
  const [loading, setLoading] = React.useState(false)
  const theme = useTheme();

  const download = (layer) => {
      if(layer.download) {
        setLoading(true)
        layer
          .download()
          .then(d => {
            console.log('done')
            setLoading(false)
          })
      }
  }

  return (
    <>
      <h4>Download</h4>
      { activeLayers.map(layer =>
          <div key={layer.name}>
            <div className='cursor-pointer' onClick={e => download(layer)}>
            {layer.name}
            </div>
            {
              loading ? <div> download processing ... </div> : ''
            }
          </div>
        )
      }
    </>
  )
}

export default Download