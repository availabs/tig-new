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
    }, [falcor])

    const processData = () => {
        let cache = get(falcorCache, ['tig', 'datasources', 'byId'], null)
        let data = []
        if (cache) {
            data = Object.keys(cache).map(item => cache[item])
        }
        return data

    }


    return (
        <div className='border-t-2 border-teal-600'>
            <div className='bg-tigGreen-100 text-xl w-28 py-3 pl-4 text-white mb-2'> Catalog </div>
            {processData() ?
                <ul className="">
                    {processData().map((item) => (
                        <li key={item.id.value} className="border-t py-13px">
                            <div className="flex space-x-3">
                                <div className="min-w-5xl flex-1">
                                    <p className="text-sm font-bold text-gray-900 mt-10px">
                                        <Link to={{
                                            pathname: `/datasource/${item.id.value}`,
                                            state: {name: item.name.value, description: item.description.value}
                                        }} className="hover:underline py-6px px-12px border-1">
                                            {item.name.value}
                                        </Link>
                                    </p>
                                </div>
                                <MenuComponent/>
                            </div>
                            {/*<div className="opacity-50 py-4">
                                <p>{item.description.value}</p>
                            </div>*/}
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
