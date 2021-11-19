import React from "react"
import { withAuth } from '@availabs/avl-components'


import TigLayout from 'components/tig/TigLayout'

const Table = withAuth(({ mapOptions,layers,views}) => {
  


    return (
        <TigLayout>
            <div className='w-full flex-1 flex'>   
                <h4>Table Coming</h4>
               
            </div>
        </TigLayout>
    )
})


const TablePage  = {
    path: `/views/:viewId/table`,
    mainNav: false,
    name: "TIG Table",
    exact: true,
    // authLevel: 0,
    layout: 'Simple',
    component: Table
}

export default TablePage;
