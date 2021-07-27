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

const FetchTigSources = () => {
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
        <div>

            {processData() ?
                <ul className="px-4 py-8 space-y-5 z-10">
                    {processData().map((item) => (
                        <li key={item.id.value} className="bg-gray-200 shadow rounded-md px-4 py-6 sm:px-6">
                            <div className="flex space-x-3">
                                <div className="min-w-5xl flex-1">
                                    <p className="text-lg font-medium text-gray-900">
                                        <Link to={{
                                            pathname: `/datasource/${item.id.value}`,
                                            state: {name: item.name.value, description: item.description.value}
                                        }} className="hover:underline">
                                            {item.name.value}
                                        </Link>
                                    </p>
                                </div>
                                <MenuComponent/>
                            </div>
                            <div className="opacity-50 py-4">
                                <p>{item.description.value}</p>
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

export default FetchTigSources
