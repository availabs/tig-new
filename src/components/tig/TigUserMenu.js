import React, {Fragment}  from "react"
// import { TopNav } from 'components/avl-components/src'
import { Listbox, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom'

const TigDropDown = ({buttonText, items}) => {
    return (
        <Listbox>
            <div className='relative bg-tigGray-200  md:mr-2 '>
                <Listbox.Button className="p-4 h-full text-left bg-tigGray-200 my-2 md:my-0 text-[13px] font-light ">
                    <span className="truncate">{buttonText}</span>  
                    <span className='pl-2 fa fa-caret-down'/>
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="z-50 absolute right-2 py-1.5 overflow-auto text-xs shadow-lg max-h-96 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-xs" style={{background: '#bbd4cb'}}>
                      {items.map((item, personIdx) => (
                        <Listbox.Option
                          key={personIdx}
                          className={({ active }) =>
                            `${active ? 'text-amber-900 bg-white' : 'text-gray-900'}
                                  cursor-default select-none relative `
                          }
                        >
                          {({ selected, active }) => (
                            <Link to={`${item.link}`}>
                              <span
                                className={`font-light text-sm block px-6 truncate py-0.5`}
                              >
                                {item.name}
                              </span>
                              
                            </Link>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
            </div>
        </Listbox>
    )
}

const TigUserMenu = ({user}) => {

    const userItems = [
        {name: 'Catalog', link: '/'},
        {name: 'My Settings', link: '/'},
        {name: 'My Study Areas', link: '/'},
        {name: 'My Snapshots', link: '/'},
        {name: "What I'm Watching", link: '/'},
        {name: 'Recent Activity', link: '/'}
    ]

    const userMenu = (
        <TigDropDown
            buttonText={<span>Welcome, - {user.email}</span>}
            items={userItems}
        />
    )

    const adminItems = [
        {name:"Users", link: '/'},
        {name:"Agencies", link: '/'},
        {name:"All Comments", link: '/'},
        {name:"All Uploads", link: '/'},
        {name:"All Study Areas", link: '/'},
        {name:"Data Recovery", link: '/'},
        {name:"System Usage Report", link: '/'},
        {name:"System Change Report", link: '/'},
        {name:"User Activity Report", link: '/'},
        {name:"Update Help", link: '/'}
    ]

    const adminMenu = (
        <TigDropDown
            buttonText={'Admin'}
            items={adminItems}
        />
    )
    const contributorMenu = (
        <a href={`/sources?contributor_id=${user.id}`} 
            className='p-4 h-full hover:bg-tigGray-50 hover:text-yellow-500 hover:cursor-pointer bg-tigGray-200 text-[13px] font-light md:mr-2'>
            Contributor
        </a>
    )

    const librarianMenu = (
        <a href={`/sources?librarian_id=${user.id}`} 
            className='p-4 h-full hover:bg-tigGray-50 hover:text-yellow-500 hover:cursor-pointer bg-tigGray-200 text-[13px] font-light md:mr-2'>
            Librarian
        </a>
    )

    // const adminMenu = () 

    // const contributerMenu = ()

    return (
        <div className='flex h-12 flex-col md:flex-row'>
            {userMenu}
            {adminMenu}
            {contributorMenu}
            {librarianMenu}
            <a href={'/logout'} className='p-4 h-full hover:bg-tigGray-50 hover:text-yellow-500 hover:cursor-pointer bg-tigGray-200 text-[13px] font-light md:mr-2'>Logout</a>
        </div> 
    )
}

export default TigUserMenu
