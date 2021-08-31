import React from "react"
import { withAuth } from '@availabs/avl-components'
import TigNav from './TigNav'
import TigBreadcrumbs from './TigBreadcrumbs'

const TigLayout = withAuth(({children}) => {
    return (
        <div className='w-full max-w-6xl mx-auto'>
            <div className='z-10'>
                <TigNav />
            </div>
            <TigBreadcrumbs />
            <p className={'text-xs text-gray-700 mb-2'}>
                You are currently viewing x of the y available data sources in the Gateway. Click on one of the following sources and associated views to see the data in Table, Map or Chart form. Create an account or log in to see more.
            </p>
            <div className=''>
                {children}
            </div>
        </div>
    )
})

export default TigLayout