import React, {Fragment} from "react"
import { Link, useHistory } from 'react-router-dom'
import {useParams, useLocation} from 'react-router-dom'
import { Listbox, Transition } from '@headlessui/react'
import { useFalcor } from '@availabs/avl-components'
import get from 'lodash.get' 

const TigBreadcrumbs = ({children}) => {
    let {viewId,dataSourceId} = useParams()
    let {falcor, falcorCache} = useFalcor()
    let location = useLocation()
    const history = useHistory();

    React.useEffect(() =>{
        async function fetchData() {
            let getLength = await falcor.get(["tig", "datasources", "length"])
            let length = get(getLength, ['json', 'tig', 'datasources', 'length'], 0)

            let getDatasources = await falcor
                    .get(["tig", "datasources", "byIndex", [{from: 0, to: length - 1}], ['id','name']])
            let dsdata = get(getDatasources, ["json","tig", "datasources", "byIndex"], {})
            let datasourcesIds = Object.keys(dsdata)
                .map(k => get(dsdata, `${k}.id`, null))
                .filter(d => d)

            let getDsLengths  = await falcor.get(["tig","datasources","views","sourceId",datasourcesIds,'length'])

            let viewGet = datasourcesIds.map(datasourceId => {
                let dsLength = +get(getDsLengths,["json","tig","datasources","views","sourceId",datasourceId,'length'],1)
                let output  = ["tig","datasources","views","sourceId",datasourceId,"byIndex",[{from:0,to:(dsLength-1)}],['id','name', 'source_id']]
                return output
            })
            return await falcor.get(...viewGet)    
        }
        return fetchData();
    },[falcor,viewId])

    let sources = React.useMemo(() => {
        let ds = get(falcorCache,["tig","datasources","byId"], {})
        let dataSourceIds = Object.keys(get(falcorCache,["tig","datasources","views","sourceId"], {}))
        let datasources = dataSourceIds.reduce((out, dsId) => {
           out[dsId] = {
                id: get(ds[dsId],['id','value'],''),
                name: get(ds[dsId],['name','value'],'')
            }
            return out
        },{})
        let bySource = dataSourceIds.reduce((out, dsId) => {
            let views = get(falcorCache, ["tig","datasources","views","sourceId",dsId,"byIndex"], {})
            out[dsId] = Object.keys(views).map(k => {
                let view = get(falcorCache,views[k].value, null)
                return {
                    id: get(view,['id','value'],''),
                    source_id: get(view,['source_id','value'],''),
                    name: get(view,['name','value'],''),
                }
            }).filter(d => d)
            .sort((a,b) => a.name - b.name)
            return out
        },{})
        let byView = Object.keys(bySource).reduce((out,dsId) => {
            bySource[dsId].forEach(view => {
                out[view.id] = view 
            })
            return out
        },{})
        return {
            byView,bySource,datasources
        }
    },[falcorCache])
    let selected = get(sources,['byView',viewId],{})
    let views = get(sources,['bySource', selected.source_id], [])
    let activeSource = get(sources, ['datasources',selected.source_id], {})
    let actions = [
        {
            path: 'map',
            name: 'Map'
        },
         {
            path: 'table',
            name: 'Table'
        },
        {
            path: 'chart',
            name: 'Chart'
        },
         {
            path: 'metadata',
            name: 'View Metadata'
        }
    ]
    let activeAction = actions.filter(d => d.path === location.pathname.split('/').pop().toLowerCase()).pop()
    

    return (
        <div className='w-full flex justify-between py-6 items-baseline z-10'>
            <div className='flex items-stretch'>
                
                <a href='/' 
                    className='bg-tigGray-100 hover:bg-tigGray-50 hover:text-orange-300 hover:cursor-pointer py-1 px-3 text-sm text-gray-600'>
                    Catalog
                </a>
                {viewId ?
                <>
                <div 
                className='ml-2 bg-tigGray-100 hover:bg-tigGray-50 hover:text-orange-300 hover:cursor-pointer text-sm text-gray-600' style={{background: '#bbd4cb'}}>
                    <Listbox value={selected} onChange={(e) => {
                        console.log('on change', )
                        let url = `/views/${e.id}/${activeAction.path}`
                        history.push(url)
                    }}>
                        <div className="relative">
                            <Listbox.Button className="py-1 px-3 relative w-full text-left cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                                <span className=" truncate">{activeSource.name}</span>
                                <span className='pl-2 fa fa-caret-down'/>
                            </Listbox.Button>
                            <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options className="z-50 absolute py-1 mt-1 overflow-auto text-xs shadow-lg max-h-96 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm" style={{background: '#bbd4cb'}}>
                                  {views.map((view, personIdx) => (
                                    <Listbox.Option
                                      key={personIdx}
                                      className={({ active }) =>
                                        `${active ? 'text-amber-900 bg-white' : 'text-gray-900'}
                                              cursor-default select-none relative `
                                      }
                                      value={view}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span
                                            className={`${
                                              selected ? 'font-medium' : 'font-thin'
                                            } block px-6 truncate`}
                                          >
                                            {view.name}
                                          </span>
                                          {selected ? (
                                            <span
                                              className={`${
                                                active ? 'text-amber-600' : 'text-amber-600'
                                              }
                                              absolute inset-y-0 left-0 flex items-center pl-3`}
                                            >
                                              {/*<CheckIcon className="w-5 h-5" aria-hidden="true" />*/}
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                        </div>
                    </Listbox>
                </div> 
                <div 
                className='ml-2 bg-tigGray-100 hover:bg-tigGray-50 hover:text-orange-300 hover:cursor-pointer text-sm text-gray-600' style={{background: '#bbd4cb'}}>
                   <Listbox value={activeAction} onChange={(e) => {
                        let url = `/views/${viewId}/${e.path}`
                        console.log('url', url)
                        history.push(url)
                    }}>
                        <div className="relative">
                            <Listbox.Button className="py-1 px-3 relative w-full text-left cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                                <span className=" truncate">{activeAction.name}</span>
                                <span className='pl-2 fa fa-caret-down'/>
                            </Listbox.Button>
                            <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options className="z-50 absolute py-1 mt-1 overflow-auto text-xs shadow-lg max-h-96 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm" style={{background: '#bbd4cb'}}>
                                  {actions.map((view, personIdx) => (
                                    <Listbox.Option
                                      key={personIdx}
                                      className={({ active }) =>
                                        `${active ? 'text-amber-900 bg-white' : 'text-gray-900'}
                                              cursor-default select-none relative `
                                      }
                                      value={view}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span
                                            className={`${
                                              selected ? 'font-medium' : 'font-thin'
                                            } block px-6 truncate`}
                                          >
                                            {view.name}
                                          </span>
                                          {selected ? (
                                            <span
                                              className={`${
                                                active ? 'text-amber-600' : 'text-amber-600'
                                              }
                                              absolute inset-y-0 left-0 flex items-center pl-3`}
                                            >
                                              {/*<CheckIcon className="w-5 h-5" aria-hidden="true" />*/}
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                        </div>
                    </Listbox>
                </div>
                </>
                : ''
                }

            </div>
            <a href='/Gatewayhelp.htm'>
                <span className='fa fa-question text-sm text-gray-600' />
            </a>
        </div>
    )
}

export default TigBreadcrumbs