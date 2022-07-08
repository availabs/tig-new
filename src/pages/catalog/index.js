import React from 'react';
import {Redirect} from 'react-router-dom'
import {withAuth} from '@availabs/avl-components'
import DataSourceList from "./tigDataSources/DatasourceList";
import RecentActivity from "./tigDataSources/RecentActivity";


import TigLayout from 'components/tig/TigLayout'

const Landing = () =>
  <>
    <div className='grid grid-cols-1 gap-4 items-start lg:grid-cols-5 lg:gap-8'>
      <div className='grid grid-cols-1 gap-4 lg:col-span-3'>
        <DataSourceList />
      </div>
      <div className='grid grid-cols-1 gap-4 lg:col-span-2'>
        <RecentActivity />
      </div>
    </div>  
  </>


const AuthedLanding = withAuth(({ title, shadowed = true, user, children }) => {
  // if(user && user.authLevel > 0) {
  //   return <Redirect to="/admin" />
  // }
  return <Landing />
})

const config = {
  path: "/",
  exact: true,
  component: AuthedLanding
}


export default config;

