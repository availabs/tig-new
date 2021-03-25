import React from 'react';
import { Pattern } from 'pages/Landing'

const Admin = () =>
  <div className='h-screen flex-1 flex flex-col text-white bg-gray-800'>
      <Pattern />
      <div className="flex-1 flex items-center justify-center flex-col">
        <div className="text-6xl font-bold">TDS</div>
        <div className="text-xl">Management</div>
      </div>
  </div>

const config = {
  path: "/admin",
  exact: true,
  mainNav: true,
  name: 'Home',
  component: Admin,
  layoutSettings: {
    fixed: true,
    headerBar: true,
    logo: "AVAIL",
    navBar: 'side'
  }
}



export default config;
