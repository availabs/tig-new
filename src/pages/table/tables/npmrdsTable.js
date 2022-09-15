import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from 'components/avl-components/src'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";
import MoreButton from "./components/moreButton";

const fetchGeo = (falcor, states) => {
    return falcor.get(["geo", states, "geoLevels"])
}

const fetchData = (falcor, filtered, month, year, setLoading) => {
    if (!filtered.length) return null;

    setLoading(true)
    let requests = filtered.reduce((a, c) => {
        a.push(['tig','npmrds',`${month}|${year}`,`${c.geolevel}|${c.value}`, 'data'])
        a.push(["geo", c.geolevel.toLowerCase(), c.value, "geometry"]);
        return a;
    },[])

    return falcor.get(...requests).then(d => {
        setLoading(false)
    })
}

const RenderTable = (data, pageSize, filteredColumns) => useMemo(() =>
    <Table
        data={data}
        columns={
            Object.keys(data[0] || {})
                .filter(c => !filteredColumns.includes(c))
                .map(c => ({
                Header: c,
                accessor: c,
                align: ['tmc', 'roadname', 'direction'].includes(c) ? 'left' : 'right',
                    filterLocation: 'inline',
                    disableFilters: !['tmc', 'roadname'].includes(c)
            }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize, filteredColumns])

const NpmrdsTable = ({name, type}) => {
    const {falcor, falcorCache} = useFalcor();
    const [loading, setLoading] = useState(false)
    const [geography, setGeography] = useState('All')
    const [year, setYear] = useState(2019)
    const [month, setMonth] = useState(1)
    const [hour, setHour] = useState(15)
    const [dow, setDow] = useState('Thursday')
    const [vehicles, setVehicles] = useState('All Vehicles')
    const [pageSize, setPageSize] = useState(50)
    const [speedFrom, setSpeedFrom] = useState(0)
    const [speedTo, setSpeedTo] = useState(100)
    const [direction, setDirection] = useState('all')
    const [filteredColumns, setFilteredColumns] = useState([])

    const getterSetters = {
        geography: {get: geography, set: setGeography},
        year: {get: year, set: setYear},
        month: {get: month, set: setMonth},
        hour: {get: hour, set: setHour},
        dow: {get: dow, set: setDow},
        vehicles: {get: vehicles, set: setVehicles},
        pageSize: {get: pageSize, set: setPageSize},
        speedFrom: {get: speedFrom, set: setSpeedFrom},
        speedTo: {get: speedTo, set: setSpeedTo},
        direction: {get: direction, set: setDirection}
    }

    const states = ["36","34","09","42"];

    useEffect(() => fetchGeo(falcor, states), []);

    const filtered = useMemo(() => {
        let allGeo = get(falcorCache,['geo'],{})
        if(!Object.keys(allGeo).length) return [];

        let geographies =
            flatten(states.map(s => allGeo[s].geoLevels.value))
                .map(geo => ({
                    name: `${(geo.geoname || '').toUpperCase()} ${geo.geolevel}`,
                    geolevel: geo.geolevel,
                    value: geo.geoid
                }));

        let geoids = filters.geography.domain.filter(d => d.name === geography)[0].value

        return geographies.filter(({ value }) => geoids.includes(value));
    }, [falcorCache, geography, month, year]);

    useEffect(() => fetchData(falcor, filtered, month, year,setLoading), [falcorCache, geography, month, year]);

    let data = useMemo(() => {
        return filtered.map(d => get(falcorCache, ['tig','npmrds',`${month}|${year}`,`${d.geolevel}|${d.value}`, 'data','value'],[]))
            .reduce((out,d) => {
                return [
                    ...out,
                    ...Object.keys(d)
                        .filter(d1 =>
                            (!speedFrom || d[d1].s.find(s1 => s1 >= speedFrom && (!speedTo || s1 <= speedTo))) &&
                            (!speedTo || d[d1].s.find(s1 => s1 <= speedTo && (!speedFrom || s1 >= speedFrom))) &&
                            (direction === 'all' || d[d1].direction === direction)
                        )
                        .map(d1 => (
                        {
                            tmc: d1,
                            roadname: d[d1].roadname,
                            direction: d[d1].direction,
                            // length: d[d1].length,
                            ...d[d1].s.reduce((accHours, value, hour) => {
                                if(
                                    (!speedFrom || (value >= speedFrom && (!speedTo || value <= speedTo))) &&
                                    (!speedTo || (value <= speedTo && (!speedFrom || value >= speedFrom)))
                                ){
                                    accHours[('0' + hour + ':00').slice(-5)] = value;
                                }else{
                                    accHours[('0' + hour + ':00').slice(-5)] = null
                                }
                                return accHours
                            }, {})
                        }))
                ]
            }, [])
    }, [falcorCache, month, year, filtered, speedFrom, speedTo, direction])

    return (
        <div className='w-full'>
            <div className={'font-light text-lg'}> {name} </div>

            <div className={`w-5 flex pb-1 text-xs`}>
                <label  className={`self-center px-1 font-bold`}>Area:</label>
                <Select
                    id={'geography'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    {...filters.geography}
                    onChange={e => getterSetters.geography.set(e)}
                    value={getterSetters.geography.get}
                /> <span  className={`self-center px-1 font-bold`}>Data</span>
            </div>

            <div className={'flex flex-row pb-5 text-xs'}>
                {
                    Object.keys(filters)
                        .filter(f => !['hour', 'geography'].includes(f))
                        .map((f, fI) =>
                            <>
                                <label className={`self-center px-1 font-bold`}>{filters[f].name}:</label>
                                <Select
                                    id={f}
                                    themeOptions={{
                                        size: 'compact'
                                    }}
                                    {...filters[f]}
                                    onChange={e => getterSetters[f].set(e)}
                                    value={getterSetters[f].get}
                                />
                            </>)
                }
            </div>

            <div className={'flex flex-row pb-5 items-center text-xs'}>
                <label  className={`px-1 font-bold text-xs whitespace-nowrap`}>Speed (mph) from</label>
                <Input
                    id={'speedFrom'}
                    value={speedFrom}
                    onChange={e => getterSetters.speedFrom.set(e)}
                    
                />
                <label  className={`px-1 font-bold text-xs`}>to</label>
                <Input
                    id={'speedTo'}
                    value={speedTo}
                    onChange={e => getterSetters.speedTo.set(e)}
                    
                />

                <label  className={`px-1 font-bold text-xs`}>Show:</label>
                <Select
                    id={'pageSize'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    domain={[10, 25, 50, 100]}
                    onChange={e => getterSetters.pageSize.set(e)}
                    value={pageSize}
                    multi={false}
                /><span  className={`px-1 font-bold text-xs`}>entries</span>

                <MoreButton className={'pl-3'}
                            data={data || []}
                            columns={Object.keys(data[0] || {})}
                            filteredColumns={filteredColumns} setFilteredColumns={setFilteredColumns}
                            filename={`${name.split('_').join(' ')}`}
                />
            </div>
            {loading ? <div>Processing...</div> : ''}
            <div className='w-full overflow-x-scroll scrollbar font-sm'>
                {RenderTable(data, pageSize, filteredColumns)}
            </div>
        </div>
    )
}

export default NpmrdsTable