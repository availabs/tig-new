import React from "react"
import { withAuth, TopNav } from '@availabs/avl-components'
import { Link } from 'react-router-dom'


const TigNav = withAuth(() => {
    


    return (
        <div className='w-full'>
            <TopNav 
                LeftNav={
                    () => (
                        <Link to='/' className='bg-gray-300 hover:bg-gray-100 h-12'>
                            <img alt='NYMTC Logo' style={{height:50}} src='/images/nymtc_logo.svg'/>
                        </Link>
                    )
                }
                RightNav={
                    () => (
                        <div className='flex h-12 flex-col md:flex-row'>
                            <div className='p-3 h-full bg-gray-300 my-2 md:my-0 md:mr-2 text-sm'>Welcome!</div>
                            <div className='p-3 h-full bg-gray-300 my-2 md:my-0 md:mr-2 text-sm'>Sign Up</div>
                            <div className='p-3 h-full bg-gray-300 text-sm'>Login</div> 
                        </div>
                    )
                }
            />
        </div>
    )
})

export default TigNav