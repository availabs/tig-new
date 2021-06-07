import React, {useEffect, useState,Fragment} from 'react';
import {useParams, useLocation} from 'react-router-dom'
import {useFalcor} from '@availabs/avl-components'
import get from "lodash.get";
import MenuComponent from "../card-menu/Menu";
import {PublicNav} from "../NavBar/TopNavBar";
import { Dialog, Transition } from '@headlessui/react'
import {
    MapIcon,
    TableIcon,
    ChartBarIcon,
    FolderIcon,
    MenuIcon,
} from '@heroicons/react/outline'

const VIEWS_ATTRIBUTES = [
    'id',
    'name',
    'description',
    'source_id',
    'current_version',
    'data_starts_at',
    'data_ends_at',
    'origin_url',
    'user_id',
    'rows_updated_at',
    'rows_updated_by_id',
    'topic_area',
    'download_count',
    'last_displayed_at',
    'view_count',
    'created_at',
    'updated_at',
    'columns',
    'data_model',
    'statistic_id',
    'column_types',
    'data_levels',
    'value_name',
    'column_labels',
    'row_name',
    'column_name',
    'spatial_level',
    'data_hierarchy',
    'geometry_base_year',
    'deleted_at',
    'download_instructions',
    'value_columns',
    'short_description'
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Views = () => {
    const {dataSourceId} = useParams()
    const {falcor,falcorCache} = useFalcor()
    const [activeId,setActiveId] = useState(null)

    const location = useLocation()
    //const [sidebarOpen, setSidebarOpen] = useState(false)

    const sortIds = ((a,b) =>{
        return a.id < b.id ? 1 : -1
    })

    useEffect(() =>{
        async function fetchData() {

            let length = await falcor.get(["tig","datasources","views","sourceId",[dataSourceId],'length'])

            length = get(length,['json','tig','datasources','views',"sourceId",dataSourceId,'length'],null)
            if(length){
                const response = await falcor.get(["tig","datasources","views","sourceId",[dataSourceId],"byIndex",[{from:0,to:length-1}],VIEWS_ATTRIBUTES])
                const graph = get(response,['json','tig','datasources','views',"sourceId",dataSourceId,"byIndex"],null)
                let data = []
                if(graph){
                    data = Object.keys(graph).filter(d => d !== '$__path').map(item => graph[item]).sort(sortIds)
                    console.log('data',data)
                    setActiveId(data[0].id)
                }
            }
        }

        return fetchData();
    },[falcor,dataSourceId])

    const processData = () =>{
        let cache = get(falcorCache,['tig','datasources','views',"sourceId",dataSourceId,"byId"],null)
        let  data = []
        if(cache){
            data = Object.keys(cache).map(item => cache[item]).sort(sortIds)
        }

        return data

    }

    const onClickView = (item) =>{
        setActiveId(item.id.value)

    }

    const navigation = [
        { name: 'Map', href: `/v2/views/${activeId}/map`, icon: MapIcon, current: true, count: '5' },
        { name: 'Table', href: '#', icon: TableIcon, current: false },
        { name: 'View Meta data', href: '#', icon: FolderIcon, current: false, count: '19' },
        { name: 'Charts', href: '#', icon: ChartBarIcon, current: false },
    ]

    return (
        /*<div className= "relative overflow-hidden">
            <div className="relative">
                <PublicNav />
            </div>
            <div className="px-8 py-8 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:items-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block text-indigo-600 xl:inline">{location.state.name || ''}</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-700 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    {location.state.description || ''}
                </p>
            </div>
            <div className="w-full inline-flex items-center justify-center overflow-hidden">

                <nav className="space-y-2" aria-label="Sidebar">
                    {navigation.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                                item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                            )}
                            aria-current={item.current ? 'page' : undefined}
                        >
                            <item.icon
                                className={classNames(
                                    item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                                    'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                                )}
                                aria-hidden="true"
                            />
                            <span className="truncate">{item.name}</span>
                            {item.count ? (
                                <span
                                    className={classNames(
                                        item.current ? 'bg-white' : 'bg-gray-100 group-hover:bg-gray-200',
                                        'ml-auto inline-block py-0.5 px-3 text-xs rounded-full'
                                    )}
                                >
              {item.count}
            </span>
                            ) : null}
                        </a>
                    ))}
                </nav>
            </div>


        </div>*/
        <div className= "relative overflow-hidden">
            <div className="absolute h-12 w-full">
                <PublicNav />
            </div>
            <div className="pt-10 flex overflow-hidden bg-white">
                <div className=" hidden md:flex md:flex-shrink-0">
                    <div className="flex flex-col w-64">
                        {/* Sidebar component, swap this element with another sidebar if you like */}
                        <div className="flex flex-col h-0 flex-1 .border-t-2 border-r border-gray-200 bg-white">
                            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                                <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                                    {navigation.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                                item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                            )}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                                                    'mr-3 flex-shrink-0 h-6 w-6'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-0 flex-1 overflow-hidden">
                    <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
                        <button
                            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            /*onClick={() => setSidebarOpen(true)}*/
                        >
                            <span className="sr-only">Open sidebar</span>
                            <MenuIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                        <div className="py-6">
                            <div className="max-w-7xl mx-auto px-8 py-8 sm:px-6 md:px-8">
                                <h1 className="text-2xl tracking-tight font-extrabold text-gray-900 sm:text-2xl md:text-6xl">
                                    <span className="block text-indigo-600 xl:inline">{location.state.name || ''}</span>
                                </h1>
                                <p className="mt-3 max-w-md mx-auto text-base text-gray-700 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                                    {location.state.description || ''}
                                </p>
                            </div>
                            <div className="max-w-7xl mx-auto px-6 sm:px-6 md:px-8">
                                <div className='mx-auto max-w-10xl'>
                                    {processData() ?
                                        <ul className="space-y-4">
                                            {processData().map((item) => (
                                                <li key={item.id.value}
                                                    className={
                                                        activeId === item.id.value ? 'bg-gray-200 shadow rounded-md px-6 py-6 sm:px-6 ring-1 ring-offset-2 ring-indigo-500' :
                                                            'bg-gray-200 shadow rounded-md px-4 py-6 sm:px-6'
                                                    }

                                                >
                                                    <div className="flex space-x-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-lg font-medium text-gray-900">
                                                                <div className="hover:underline cursor-pointer" onClick={() => onClickView(item)}>
                                                                    {item.name.value}
                                                                </div>
                                                            </p>
                                                        </div>
                                                        <MenuComponent/>
                                                    </div>
                                                    <div className="opacity-50 py-4">
                                                        <p>{item.description.value || 'No Description'}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        :<div>Loading ...</div>}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}



const config = {
    path: "/datasource/:dataSourceId",
    exact: true,
    mainNav: true,
    name: 'Views Data Source',
    component: Views,
    layout: 'Simple',
    layoutSettings: {
        fixed: true,
        headerBar: true,
        logo: "AVAIL",
        navBar: 'top',
        auth: true
    }
}



export default config;
