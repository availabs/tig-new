import React from "react"
import { withAuth } from '@availabs/avl-components'
import TigNav from './TigNav'
import TigBreadcrumbs from './TigBreadcrumbs'

const TigLayout = withAuth(({children}) => {
    return (
        <div className='xl:max-w-[1170px] lg:max-w-[970px] max-w-[750px] px-[15px] mx-auto min-h-screen flex flex-col z-10' >
            <TigNav />
            <TigBreadcrumbs />
            <div className='flex-1'>
                {children}
            </div>
        </div>
    )
})

export default TigLayout