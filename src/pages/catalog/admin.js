import React from 'react';

const Admin = () =>
  <div className='h-screen flex-1 flex flex-col text-white bg-gray-800'>
      <div className="flex-1 flex items-center justify-center flex-col">
        <div className="text-6xl font-bold">TDS</div>
        <div className="text-xl">Management</div>
      </div>
  </div>

const config = {
  path: "/subdir/admin",
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
