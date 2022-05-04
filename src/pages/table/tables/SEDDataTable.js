import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import get from "lodash.get";
import {useParams} from "react-router-dom";
import _ from "lodash";
import {filters} from 'pages/map/layers/npmrds/filters.js'
import counties from "../../map/config/counties.json";

const fetchData = (falcor, type, view) => {
    return falcor.get(['tig', 'source', `${type.split('_')[2]} SED ${type.split('_')[1]} Level Forecast`, 'view', view])
        .then(d => get(d, ['json', 'tig', 'source', `${type.split('_')[2]} SED ${type.split('_')[1]} Level Forecast`, 'view', view]))
}

const processData = (data= {}, geography = '', lower, upper, type) => {
    console.log('d?', data)
    let reformat = {}
    let years = new Set();
    let areaColName = type.split('_')[1].toLowerCase() === 'taz' ? 'enclosing_name' : 'area';
    let keyCol = type.split('_')[1].toLowerCase() === 'taz' ? 'taz' : 'county';
    let sortFn = (a, b) => type.split('_')[1].toLowerCase() === 'taz' ? +b[keyCol] - +a[keyCol] : b[keyCol].localeCompare(a[keyCol])
    console.log('t?', type, type.split('_')[1].toLowerCase())
    Object.keys(data)
        .forEach(year => {
            years.add(year)
            data[year]
                .filter(entry =>
                    get(filters.geography.domain.filter(geo => geo.name === geography), [0, 'value'], [])
                        .includes(counties.filter(c => c.name === entry[areaColName])[0].geoid)
                )
                .forEach(entry => {
                    reformat[entry.area] = Object.assign(reformat[entry.area] || {}, {[year]: +entry.value})
                })
        });


    return {
        data: Object.keys(reformat)
            .map(tazId => ({[keyCol]: tazId, ...reformat[tazId]}))
            .filter(d => {
                let values = Object.keys(d).filter(d => !['taz', 'county'].includes(d)).map(k => d[k]);
                return !(upper || lower) ||
                    (
                        (!lower || !!(values.find(l => l >= lower))) &&
                        (!upper || !!(values.find(l => l <= upper)))
                    )

            })
            .sort(sortFn),
        years: [...years]
    }
}

const RenderTable = (data = {}, pageSize, type) => useMemo(() =>
    <Table
        data={data.data}
        columns={
          [type.split('_')[1].toLowerCase() === 'taz' ? 'taz' : 'county', ...data.years]
              .sort((a,b) => a === 'taz' ? -1 : a-b)
                .map(c => ({
                    Header: c,
                    accessor: c,
                    align: 'center',
                    disableFilters: !['taz', 'county'].includes(c),
                    Cell: (d) => (d.cell.value || 0).toLocaleString()
                }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize])

const SEDDataTable = ({name, type}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({data: [], years: []})
    const [pageSize, setPageSize] = useState(50)

    const [geography, setGeography] = useState('All')
    const [lower, setLower] = useState()
    const [upper, setUpper] = useState()

    const getterSetters = {
        geography: {get: geography, set: setGeography},
        lower: {get: lower, set: setLower},
        upper: {get: upper, set: setUpper},
        pageSize: {get: pageSize, set: setPageSize},
    }
    console.log('name, type', name, type)
    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(falcor, type, viewId)
        setData(processData(d, geography, lower, upper, type))
        setLoading(false)

    }, [geography, lower, upper, viewId, name]);

    const config = {
    }
    return (
        <div className='w-full'>
            <div className={'font-light text-lg'}> {name} </div>

            <div className={`flex pb-4 pt-1.5`}>
                <label  className={`self-center px-1 font-semibold text-xs`}>Area:</label>
                <Select
                    id={'geography'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    color={'transparent'}
                    className={'font-light text-sm'}
                    {...filters.geography}
                    onChange={e => getterSetters.geography.set(e)}
                    value={getterSetters.geography.get}
                /> <span  className={`self-center px-1 capitalize font-semibold text-xs`}>{type.split('_')[1]} Data</span>
            </div>

            <div className={`flex pb-3 items-center`}>
                {
                    Object.keys(config)
                        .map(f =>
                        <>
                            <label  className={`self-center px-1 whitespace-nowrap`}>{config[f].name}:</label>
                            <Select
                                id={f}
                                className={'whitespace-nowrap'}
                                {...config[f]}
                                onChange={e => getterSetters[f].set(e)}
                                value={getterSetters[f].get}
                            />
                        </>)
                }
                <label  className={`px-1 text-xs`}>From:</label>
                <Input className={'shadow-inner focus:drop-shadow-lg border border-gray-300 focus:border-none focus:border-pink-300 p-1'} type='text' id={'lower'} value={lower} onChange={setLower} placeholder={''}/>
                <label  className={`px-1 ml-5 text-xs`}>To:</label>
                <Input className={'shadow-inner focus:drop-shadow-lg border border-gray-300 focus:border-gray-300 p-1'} type='text' id={'upper'} value={upper} onChange={setUpper} large placeholder={''}/>

                <label  className={`ml-10 px-1 text-xs`}>Show:</label>
                <Select
                    id={'pageSize'}
                    themeOptions={{
                        // color: 'transparent',
                        size: 'compact'
                    }}
                    color={'transparent'}
                    className={'font-light text-sm'}
                    domain={[10, 25, 50, 100]}
                    onChange={e => getterSetters.pageSize.set(e)}
                    value={pageSize}
                    multi={false}
                /><span  className={`px-1 text-xs`}>entries</span>
            </div>


            {loading ? <div>Processing...</div> : ''}
            <div className='w-full overflow-x-scroll scrollbar font-sm'>
                {RenderTable(data, pageSize, type)}
            </div>
        </div>
    )
}

export default SEDDataTable