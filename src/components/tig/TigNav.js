import React,{useMemo} from "react"
import { withAuth, TopNav } from '@availabs/avl-components'


const TigNav = withAuth(() => {
    


    return (
        <div className='w-full'>
            <TopNav 
                LeftNav={
                    () => (<div className='bg-gray-300 hover:bg-gray-100 h-12'>
                        <img style={{height:50}} src='/images/nymtc_logo.svg'/>
                    </div>)
                }
                RightNav={
                    () => (<div className='flex h-12'>
                        <div className='p-3 h-full bg-gray-300 mr-2 text-sm'>Welcome!</div>
                        <div className='p-3 h-full bg-gray-300 mr-2 text-sm'>Sign Up</div>
                        <div className='p-3 h-full bg-gray-300 text-sm'>Login</div> 
                    </div>)
                }
            />
        </div>
    )
})

export default TigNav