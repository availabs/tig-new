import React from "react"
import { withAuth } from 'components/avl-components/src'


import TigLayout from 'components/tig/TigLayout'

const Chart = withAuth(({ mapOptions,layers,views}) => {
    return (
        <TigLayout>
            <div className='w-full flex-1 flex'>   
                <h4>Chart Coming</h4>
            </div>
        </TigLayout>
    )
})


const ChartPage  = {
    path: `/views/:viewId/Chart`,
    mainNav: false,
    name: "TIG Chart",
    exact: true,
    // authLevel: 0,
    layout: 'Simple',
    component: Chart
}

export default ChartPage;
