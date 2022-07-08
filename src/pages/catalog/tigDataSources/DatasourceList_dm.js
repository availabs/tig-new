import React, {useEffect, useMemo} from 'react';
import {useFalcor} from '@availabs/avl-components'
import MenuComponent from "../card-menu/Menu";
import get from 'lodash.get'
import {Link} from "react-router-dom";

import {SourceAttributes, ViewAttributes, getAttributes} from './attributes'

const DatasourceList = () => {
    const {falcor, falcorCache} = useFalcor();

  useEffect(() => {
      async function fetchData () {
        const lengthPath = ["datamanager", "sources", "length"];
        const resp = await falcor.get(lengthPath);
        return await falcor.get([
          "datamanager","sources","byIndex",
          {from:0, to:  get(resp.json, lengthPath, 0)-1},
          "attributes",Object.values(SourceAttributes),
        ])
      }
      return fetchData()
  }, [falcor])

  const sourcesList = useMemo(() => {
    console.log('get sourceList', falcorCache)
    return Object.values(get(falcorCache,['datamanager','sources','byIndex'],{}))
        .map(v => getAttributes(get(falcorCache,v.value,{'attributes': {}})['attributes']))
        .sort((a,b) => a.display_name.localeCompare(b.display_name))
  },[falcorCache])


    return (
        <div className='border-t-2 border-teal-600'>
            <div className='bg-tigGreen-100 text-xl w-28 py-3 pl-4 text-white mb-2'> Catalog </div>
            {sourcesList.length > 0 ?
                <ul className="">
                    {sourcesList.map((item,i) => (
                        <li key={i} className="border-t border-gray-600 py-5">
                            <div className="flex space-x-3">
                                <div className="min-w-5xl flex-1">
                                    <p className="text-sm font-bold text-gray-900 px-4 ">
                                        <Link to={{
                                            pathname: `/datasource/${get(item,['id'],'')}`,
                                            state: {name: get(item,['display_name'],''), description: get(item,['description'],'')}
                                        }} className="hover:underline hover:text-orange-500 border-1">
                                            {get(item,['display_name'],'')}
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
