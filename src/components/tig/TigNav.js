import React from "react"
import { withAuth, TopNav, /*useTheme*/ } from 'components/avl-components/src'
// import { Link } from 'react-router-dom'


const TigNav = withAuth(() => {
    return (
        <div className='z-50'>
            <TopNav
                leftMenu={(
                    <a href='/' className={' hover:bg-tigGray-50 h-12'}>
                        <img alt='NYMTC Logo' className={'bg-tigGray-200 hover:bg-tigGray-50'} style={{height:50}} src='/images/nymtc_logo.svg'/>
                    </a>)
                }
                rightMenu={
                    
                    <div className='flex h-12 flex-col md:flex-row'>
                        <a className='p-4 h-full bg-tigGray-200 my-2 md:my-0 md:mr-2 text-[13px] font-bold '>Welcome!</a>
                        <a href={'/auth/sign_up'} className='p-4 h-full hover:bg-tigGray-50 hover:text-yellow-500 hover:cursor-pointer bg-tigGray-200 mt-2 md:my-0 md:mr-2 text-[13px] font-light'>Sign up</a>
                        <a href={'/auth/login'} className='p-4 h-full hover:bg-tigGray-50 hover:text-yellow-500 hover:cursor-pointer bg-tigGray-200 text-[13px] font-light md:mr-2'>Login</a>
                    </div>
                    
                }
            />
        </div>
    )
})

export default TigNav