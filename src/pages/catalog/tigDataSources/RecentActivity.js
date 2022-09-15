import React, {useEffect} from 'react';
import {useFalcor} from 'components/avl-components/src'
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
        return ['Activity 1', 'Activity 2'].map((d, dI) => ({id: dI, value: d, name:d, link: '#'}))

    }


    return (
        <div className='border-t-2 border-teal-600'>
            <div className='bg-tigGreen-100 text-l w-36 py-4 px-4 text-white mb-2 '> Recent Activity </div>
            {processData() ?
                <ul className="">
                    {processData().map((item) => (
                        <li key={item.id} className="border-t py-13px">
                            <div className="flex space-x-3">
                                <div className="min-w-5xl flex-1">
                                    <p className="text-sm text-gray-700">
                                        <Link to={{
                                            pathname: `/datasource/${item.value}`,
                                            state: {name: item.name, description: item.description}
                                        }} className="hover:underline py-6px px-12px border-1">
                                            {item.name}
                                        </Link>
                                    </p>
                                </div>
                                <MenuComponent/>
                            </div>
                        </li>
                    ))}
                    <li className={'float-right text-sm text-gray-700'}>
                        <Link to={{
                            pathname: '#'
                        }} className="hover:underline py-6px px-12px border-1">Show More</Link>
                    </li>
                </ul>
                :
                <div>Loading ... </div>
            }
        </div>

    )
}

export default DatasourceList
