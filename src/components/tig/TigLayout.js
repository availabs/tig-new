import React from "react"
import { withAuth } from '@availabs/avl-components'
import TigNav from './TigNav'
import TigBreadcrumbs from './TigBreadcrumbs'

const TigLayout = withAuth(({children}) => {
    return (
        <div className='w-full max-w-6xl mx-auto min-h-screen flex flex-col z-10'>
            <div className='z-10'>
                <TigNav />
            </div>
            <TigBreadcrumbs />
            <div className='flex-1'>
                {children}
            </div>
        </div>
    )
})

export default TigLayout