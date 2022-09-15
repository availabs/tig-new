import React, {useEffect, useState, useMemo} from 'react';
import {useParams, useLocation} from 'react-router-dom'
import {useFalcor} from 'components/avl-components/src'
import get from "lodash.get";
import MenuComponent from "../card-menu/Menu";
import {
    MapIcon,
    TableIcon,
    ChartBarIcon,
    FolderIcon,
    MenuIcon,
} from '@heroicons/react/outline'


import TigLayout from 'components/tig/TigLayout'

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

    const dataSource = useMemo(() => {
        let cache = get(falcorCache,['tig','datasources','views',"sourceId",dataSourceId,"byId"],null)
        return cache ? Object.keys(cache).map(item => cache[item]).sort(sortIds) : false
    },[falcorCache,dataSourceId])

    const onClickView = (item) =>{
        setActiveId(item.id.value)
    }

    const navigation = [
        { name: 'Map', href: `/v2/views/${activeId}/map`, icon: MapIcon, current: true, count: '5' },
        { name: 'Table', href: `/v2/views/${activeId}/table`, icon: TableIcon, current: false },
        { name: 'View Meta data', href: '#', icon: FolderIcon, current: false, count: '19' },
        { name: 'Charts', href: '#', icon: ChartBarIcon, current: false },
    ]

    return (
        
        <>
            <div className='border-t-2 border-teal-600'>
                <div className='bg-tigGreen-100 text-xl w-28 py-3 pl-4 text-white mb-2'> Catalog </div>
                <div className="flex">
               
                <div className="flex flex-col flex-1">
                    <main className="flex-1 relative z-0">
                        <div className="px-6">
                            <div className="border-b py-4">
                                {/*<h1 className="text-2xl tracking-tight font-extrabold text-gray-900 sm:text-2xl md:text-6xl">
                                    <span className="block text-indigo-600 xl:inline">{location.state.name || ''}</span>
                                </h1>*/}
                                <p className="mt-3 text-base text-gray-700">
                                    {location.state.description || ''}
                                </p>
                            </div>
                            <div className="px-6 ">
                                
                                    {dataSource ?
                                        <ul className="pt-4">
                                            {dataSource.map((item) => (
                                                <li key={item.id.value}
                                                    className={
                                                        activeId === item.id.value ? '  px-6 py-2 sm:px-6 ring-1 ring-offset-2 ring-indigo-500' :
                                                            ' px-4 py-2 sm:px-6'
                                                    }

                                                >
                                                    <div className="flex">
                                                        <div className="flex-1">
                                                            
                                                                <div className="hover:underline cursor-pointer" onClick={() => onClickView(item)}>
                                                                    <p className="text-lg font-medium text-gray-900">
                                                                    {item.name.value}
                                                                     </p>
                                                                </div>
                                                           
                                                        </div>
                                                        <MenuComponent/>
                                                    </div>
                                                    {/*<div className="opacity-50 py-4">
                                                        <p>{item.description.value || 'No Description'}</p>
                                                    </div>*/}
                                                </li>
                                            ))}
                                        </ul>
                                        :<div>Loading ...</div>}
                            </div>
                        </div>
                    </main>
                </div>
                 <div className=" hidden md:flex md:flex-shrink-0">
                    <div className="flex flex-col w-64">
                        {/* Sidebar component, swap this element with another sidebar if you like */}
                        <div className="flex flex-col h-0 flex-1 border-l border-gray-200 bg-white">
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
            </div>
            </div>
        </>
    )
}



const config = {
    path: "/datasource/:dataSourceId",
    exact: true,
    mainNav: true,
    name: 'Views Data Source',
    component: Views,
    layoutSettings: {
        fixed: true,
        headerBar: true,
        logo: "AVAIL",
        navBar: 'top',
        auth: true
    }
}



export default config;
