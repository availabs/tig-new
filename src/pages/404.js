import React from 'react';
import { PublicNav, Pattern } from 'pages/Landing'

const NoMatch = () =>
  <div className='h-screen flex-1 flex flex-col text-white bg-gray-800'>
      <Pattern />
      <div class="relative">
        <PublicNav />
      </div>
      <div className="flex-1 flex items-center justify-center flex-col">
        <div className="text-6xl font-bold">404</div>
        <div className="text-xl">Page not Found</div>
        <div className="text-xl">Oops, Something went missing...</div>
      </div>
  </div>

const config = {
  mainNav: false,
  component: NoMatch,
  layout: "Simple",
  layoutSettings: {
    fixed: true,
    headerBar: true
  }
}

export default config;
