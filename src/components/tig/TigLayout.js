import React,{useMemo} from "react"
import { withAuth } from '@availabs/avl-components'
import TigNav from './TigNav'

const TigLayout = withAuth(({children}) => {
    return (
        <div className='w-full max-w-5xl mx-auto'>
            <TigNav />
            <div className=''>
                {children}
            </div>
        </div>
    )
})

export default TigLayout