import React from 'react';
import {Redirect} from 'react-router-dom'
import {withAuth} from '@availabs/avl-components'
import DataSourceList from "./tigDataSources/DatasourceList";
import RecentActivity from "./tigDataSources/RecentActivity";


import TigLayout from 'components/tig/TigLayout'

export const Pattern = () => 
  <div className="hidden sm:block sm:absolute sm:inset-0" aria-hidden="true">
    <svg className="absolute bottom-0 right-0 transform translate-x-1/2 mb-48 text-gray-700 lg:top-0 lg:mt-28 lg:mb-0 xl:transform-none xl:translate-x-0" width={364} height={384} viewBox="0 0 364 384" fill="none">
      <defs>
        <pattern id="eab71dd9-9d7a-47bd-8044-256344ee00d0" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
          <rect x={0} y={0} width={4} height={4} fill="currentColor" />
        </pattern>
      </defs>
      <rect width={364} height={384} fill="url(#eab71dd9-9d7a-47bd-8044-256344ee00d0)" />
    </svg>
  </div>

const Landing = () =>
  <TigLayout>
    <div className='flex'>
      <div className='flex-1'>
        <DataSourceList />
      </div>
      <div className='flex-1 pl-10'>
        <RecentActivity />
      </div>
    </div>  
  </TigLayout>


const AuthedLanding = withAuth(({ title, shadowed = true, user, children }) => {
  if(user && user.authLevel > 0) {
    return <Redirect to="/admin" />
  }
  return <Landing />
})

const config = {
  path: "/",
  exact: true,
  component: AuthedLanding,
  layout: 'Simple',
}


export default config;

