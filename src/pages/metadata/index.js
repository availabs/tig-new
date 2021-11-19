import React from "react"
import { withAuth } from '@availabs/avl-components'


import TigLayout from 'components/tig/TigLayout'

const MetaData = withAuth(({ mapOptions,layers,views}) => {
  


    return (
        <TigLayout>
            <div className='w-full flex-1 flex'>   
                <h4>MetaData Coming</h4>
               
            </div>
        </TigLayout>
    )
})


const MetaDataPage  = {
    path: `/views/:viewId/metadata`,
    name: "TIG MetaData",
    exact: true,
    // authLevel: 0,
    layout: 'Simple',
    component: MetaData
}

export default MetaDataPage;
