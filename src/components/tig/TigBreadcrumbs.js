import React from "react"
//import { withAuth } from '@availabs/avl-components'
//import 

const TigBreadcrumbs = ({children}) => {
    return (
        <div className='w-full flex justify-between py-6 items-baseline'>
            <div className='flex'>
                <div className='bg-tigGray-100 py-1 px-3 text-sm text-gray-600'>
                    Catalog
                </div>
            </div>
            <div>
                <span className='fa fa-question text-sm text-gray-600' />
            </div>
        </div>
    )
}

export default TigBreadcrumbs