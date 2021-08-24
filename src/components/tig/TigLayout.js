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
            <div className=''>
                {children}
            </div>
        </div>
    )
})

export default TigLayout