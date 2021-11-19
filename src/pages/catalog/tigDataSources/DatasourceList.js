import React, {useEffect} from 'react';
import {useFalcor} from '@availabs/avl-components'
import MenuComponent from "../card-menu/Menu";
import get from 'lodash.get'
import {Link} from "react-router-dom";

const SOURCES_ATTRIBUTES = [
    'id',
    'name',
    'description',
    'current_version',
    'data_starts_at',
    'data_ends_at',
    'origin_url',
    'user_id',
    'rows_updated_at',
    'rows_updated_by_id',
    'topic_area',
    'source_type'
]

const DatasourceList = () => {
    const {falcor, falcorCache} = useFalcor();

    useEffect(() => {
        async function fetchData() {
            let length = await falcor.get(["tig", "datasources", "length"])
            length = get(length, ['json', 'tig', 'datasources', 'length'], 0)

            if (length) {
                return await falcor.get(["tig", "datasources", "byIndex", [{
                    from: 0,
                    to: length - 1
                }], SOURCES_ATTRIBUTES])
            }
        }

        return fetchData();
    }, [])

    const sourcesList = React.useMemo(() => {
        console.log('Data source list process data')
        let sourcesById = get(falcorCache, ['tig', 'datasources', 'byId'], null)
        let data = []
        if (sourcesById) {
            data = Object.keys(sourcesById).map(id => sourcesById[id])
        }
        console.log('sourcesList', data)
        return data

    },[falcorCache])


    return (
        <div className='border-t-2 border-teal-600'>
            <div className='bg-tigGreen-100 text-xl w-28 py-3 pl-4 text-white mb-2'> Catalog </div>
            {sourcesList.length > 0 ?
                <ul className="">
                    {sourcesList.map((item,i) => (
                        <li key={i} className="border-t py-13px">
                            <div className="flex space-x-3">
                                <div className="min-w-5xl flex-1">
                                    <p className="text-sm font-bold text-gray-900 mt-10px">
                                        <Link to={{
                                            pathname: `/datasource/${get(item,['id','value'],'')}`,
                                            state: {name: get(item,['name','value'],''), description: get(item,['description','value'],'')}
                                        }} className="hover:underline py-6px px-12px border-1">
                                            {get(item,['name','value'],'')}
                                        </Link>
                                    </p>
                                </div>
                                <MenuComponent/>
                            </div>
                           
                        </li>
                    ))}
                </ul>
                :
                <div>Loading ... </div>
            }
        </div>

    )
}

export default DatasourceList
