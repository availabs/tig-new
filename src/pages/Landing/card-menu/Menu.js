import React, {Fragment} from 'react'
import {DotsVerticalIcon,StarIcon} from "@heroicons/react/solid";
import {Menu,Transition} from "@headlessui/react";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}


const MenuComponent = () =>{
    return (
        <div className="flex-shrink-0 self-center flex">
            <Menu as="div" className="relative z-30 inline-block text-left">
                {({ open }) => (
                    <>
                        <div>
                            <Menu.Button className="-m-2 p-2 rounded-full flex items-center text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Open options</span>
                                <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
                            </Menu.Button>
                        </div>

                        <Transition
                            show={open}
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items
                                static
                                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <div
                                                
                                                className={classNames(
                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                    'flex px-4 py-2 text-sm'
                                                )}
                                            >
                                                <StarIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                <span>Add to favorites</span>
                                            </div>
                                        )}
                                    </Menu.Item>
                                    {/*<Menu.Item>*/}
                                    {/*    {({ active }) => (*/}
                                    {/*        <a*/}
                                    {/*            href="#"*/}
                                    {/*            className={classNames(*/}
                                    {/*                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',*/}
                                    {/*                'flex px-4 py-2 text-sm'*/}
                                    {/*            )}*/}
                                    {/*        >*/}
                                    {/*            <CodeIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />*/}
                                    {/*            <span>Embed</span>*/}
                                    {/*        </a>*/}
                                    {/*    )}*/}
                                    {/*</Menu.Item>*/}
                                    {/*<Menu.Item>*/}
                                    {/*    {({ active }) => (*/}
                                    {/*        <a*/}
                                    {/*            href="#"*/}
                                    {/*            className={classNames(*/}
                                    {/*                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',*/}
                                    {/*                'flex px-4 py-2 text-sm'*/}
                                    {/*            )}*/}
                                    {/*        >*/}
                                    {/*            <FlagIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />*/}
                                    {/*            <span>Report content</span>*/}
                                    {/*        </a>*/}
                                    {/*    )}*/}
                                    {/*</Menu.Item>*/}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </>
                )}
            </Menu>
        </div>
    )
}

export default MenuComponent
