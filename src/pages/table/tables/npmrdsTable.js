import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";

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

const RenderTable = (data, pageSize) => useMemo(() =>
    <Table
        data={data}
        columns={
            Object.keys(data[0] || {}).map(c => ({
                Header: c,
                accessor: c,
                align: 'center'
            }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize])

const NpmrdsTable = ({name}) => {
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
    const [direction, setDirection] = useState('All')

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
            <div> {name} </div>

            <div className={`w-5 flex pb-1`}>
                <label  className={`self-center px-1 font-bold text-sm`}>Area:</label>
                <Select
                    id={'geography'}
                    {...filters.geography}
                    onChange={e => getterSetters.geography.set(e)}
                    value={getterSetters.geography.get}
                /> <span  className={`self-center px-1 font-bold text-sm`}>Data</span>
            </div>

            <div className={'flex flex-row pb-5'}>
                {
                    Object.keys(filters)
                        .filter(f => !['hour', 'geography'].includes(f))
                        .map((f, fI) =>
                            <>
                                <label className={`self-center px-1 font-bold text-sm`}>{filters[f].name}:</label>
                                <Select
                                    id={f}
                                    {...filters[f]}
                                    onChange={e => getterSetters[f].set(e)}
                                    value={getterSetters[f].get}
                                />
                            </>)
                }
            </div>

            <div className={'flex flex-row pb-5 items-center w-1/2'}>
                <label  className={`px-1 font-bold text-sm whitespace-nowrap`}>Speed (mph) from</label>
                <Input
                    id={'speedFrom'}
                    value={speedFrom}
                    onChange={e => getterSetters.speedFrom.set(e)}
                    
                />
                <label  className={`px-1 font-bold text-sm`}>to</label>
                <Input
                    id={'speedTo'}
                    value={speedTo}
                    onChange={e => getterSetters.speedTo.set(e)}
                    
                />

                <label  className={`px-1 font-bold text-sm`}>Show:</label>
                <Select
                    id={'pageSize'}
                    domain={[10, 25, 50, 100]}
                    onChange={e => getterSetters.pageSize.set(e)}
                    value={pageSize}
                    multi={false}
                /><span  className={`px-1 font-bold text-sm`}>entries</span>
            </div>
            {loading ? <div>Processing...</div> : ''}
            <div className='w-full overflow-x-scroll scrollbar font-sm'>
                {RenderTable(data, pageSize)}
            </div>
        </div>
    )
}

export default NpmrdsTable