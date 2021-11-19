import React from 'react';
import {Redirect} from 'react-router-dom'
import {withAuth} from '@availabs/avl-components'
import DataSourceList from "./tigDataSources/DatasourceList";
import RecentActivity from "./tigDataSources/RecentActivity";


import TigLayout from 'components/tig/TigLayout'

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

