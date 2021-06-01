import React,{useEffect} from 'react';
import {Link, useParams,useLocation} from 'react-router-dom'
import {useFalcor} from '@availabs/avl-components'
import get from "lodash.get";
import MenuComponent from "../card-menu/Menu";

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
const Views = () => {
    const {dataSourceId} = useParams()
    const {falcor,falcorCache} = useFalcor()
    const location = useLocation()

    useEffect(() =>{
        async function fetchData() {

            let length = await falcor.get(["tig","datasources","views","sourceId",[dataSourceId],'length'])

            length = get(length,['json','tig','datasources','views',"sourceId",dataSourceId,'length'],null)
            if(length){
                return await falcor.get(["tig","datasources","views","sourceId",[dataSourceId],"byIndex",[{from:0,to:length-1}],VIEWS_ATTRIBUTES])
            }
        }

        return fetchData();
    },[falcor,dataSourceId])

    const processData = () =>{
        let cache = get(falcorCache,['tig','datasources','views',"sourceId",dataSourceId,"byId"],null)
        let  data = []
        if(cache){
            data = Object.keys(cache).map(item => cache[item])
        }

        return data

    }


    return (
        <div className="relative pt-6 pb-16 sm:pb-24">
            <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block text-indigo-600 xl:inline">{location.state.name || ''}</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    {location.state.description || ''}
                </p>
            </div>
            <div className='mx-auto max-w-7xl'>
                {processData() ?
                    <ul className="space-y-5 z-10">
                        {processData().map((item) => (
                            <li key={item.id.value} className="bg-white shadow rounded-md px-4 py-6 sm:px-6">
                                <div className="flex space-x-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-lg font-medium text-gray-900">
                                            <Link to={{pathname:``}} className="hover:underline">
                                                {item.name.value}
                                            </Link>
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
    )
}


const config = {
    path: "/datasource/:dataSourceId",
    exact: true,
    mainNav: false,
    name: 'Views Data Source',
    component: Views,
    layout: 'Simple',
    layoutSettings: {
        fixed: true,
        headerBar: false,
        logo: "AVAIL",
        navBar: 'side'
    }
}



export default config;
