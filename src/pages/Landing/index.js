import React from 'react';
import {Redirect} from 'react-router-dom'
import {withAuth} from '@availabs/avl-components'
import FetchTigSources from "./tigDataSources/fetchTigSources";
import {PublicNav} from "./NavBar/TopNavBar";

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
 <div className="relative overflow-hidden">
   <div className="relative">
     <PublicNav />
   </div>

  <div className="relative pt-6 pb-16 sm:pb-24">
    <main className="flex-auto mt-16 sm:mt-24">
      <div className="mx-auto max-w-7xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
            <div>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">NYMTC</span>
                <span className="block text-indigo-600"> Transportation Information Gateway</span>
              </h1>
              {/*<p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">*/}
              {/*  Maintaining an up-to-date inventory of public roadways in New York State, including physical and administrative data about the roads.*/}
              {/*</p>*/}
            </div>

          </div>
          <div className="mt-8 sm:px-16 sm:mt-8 lg:mt-0 lg:col-span-6 ">

          </div>
        </div>
        <FetchTigSources/>
      </div>

    </main>
  </div>
</div>

const AuthedLanding = withAuth(({ title, shadowed = true, user, children }) => {
  if(user && user.authLevel > 0) {
    return <Redirect to="/admin" />
  }
  return <Landing />
})

const config = {
  path: "/",
  exact: true,
  mainNav: false,
  component: AuthedLanding,
  layout: 'Simple',
  layoutSettings: {
    fixed: true,
    headerBar: false,
    logo: "AVAIL",
    navBar: 'side'
  }
}


export default config;

