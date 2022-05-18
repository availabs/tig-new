import React from "react"
import { withAuth } from '@availabs/avl-components'
import TigNav from './TigNav'
import TigBreadcrumbs from './TigBreadcrumbs'

const TigLayout = withAuth(({children}) => {
    return (
        <div className='w-full mx-auto min-h-screen flex flex-col z-10' style={{maxWidth: '71rem'}}>
            <TigNav />

            <TigBreadcrumbs />

            <div className='flex-1'>
                {children}
            </div>
        </div>
    )
})

export default TigLayout