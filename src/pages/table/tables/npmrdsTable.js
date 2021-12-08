import {useState, useMemo, useEffect} from 'react'
import {Select, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";

const fetchGeo = (falcor, states) => {
    return falcor.get(["geo", states, "geoLevels"])
}

const fetchData = (falcor, filtered, month, year) => {
    if (!filtered.length) return null;

    let requests = filtered.reduce((a, c) => {
        a.push(['tig','npmrds',`${month}|${year}`,`${c.geolevel}|${c.value}`, 'data'])
        a.push(["geo", c.geolevel.toLowerCase(), c.value, "geometry"]);
        return a;
    },[])

    return falcor.get(...requests)
}

const NpmrdsTable = () => {
    const {falcor, falcorCache} = useFalcor();

    const [geography, setGeography] = useState('All')
    const [year, setYear] = useState(2019)
    const [month, setMonth] = useState(1)
    const [hour, setHour] = useState(15)
    const [dow, setDow] = useState('Thursday')
    const [vehicles, setVehicles] = useState('All Vehicles')

    const getterSetters = {
        geography: {get: geography, set: setGeography},
        year: {get: year, set: setYear},
        month: {get: month, set: setMonth},
        hour: {get: hour, set: setHour},
        dow: {get: dow, set: setDow},
        vehicles: {get: vehicles, set: setVehicles},
    }

    const states = ["36","34","09","42"];

    useEffect(() => fetchGeo(falcor, states), []);

    const filtered = useMemo(() => {
        let allGeo = get(falcorCache,['geo'],{})
        if(!Object.keys(allGeo).length) return [];

        let geographies =
            flatten(states.map(s => allGeo[s].geoLevels.value))
                .map(geo => ({
                    name: `${geo.geoname.toUpperCase()} ${geo.geolevel}`,
                    geolevel: geo.geolevel,
                    value: geo.geoid
                }));

        let geoids = filters.geography.domain.filter(d => d.name === geography)[0].value

        return geographies.filter(({ value }) => geoids.includes(value));
    }, [falcorCache, geography, month, year]);

    useEffect(() => fetchData(falcor, filtered, month, year), [falcorCache, geography, month, year]);

    let data = useMemo(() => {
        return filtered.map(d => get(falcorCache, ['tig','npmrds',`${month}|${year}`,`${d.geolevel}|${d.value}`, 'data','value'],[]))
            .reduce((out,d) => {
                return [
                    ...out,
                    ...Object.keys(d).map(d1 => (
                        {tmc:d1, roadname: d[d1].roadname, length: d[d1].length,
                            ...d[d1].s.reduce((accHours, value, hour) => {
                                accHours[('0' + hour + ':00').slice(-5)] = value;
                                return accHours
                            }, {})
                        }))
                ]
            }, [])
    }, [falcorCache, month, year, filtered])


    return (
        <div>
            <div> NPMRDS Speed (mph) </div>
            <div className={'flex flex-row'}>
                {
                    Object.keys(filters)
                        .map((f, fI) =>
                            <>
                                <label>{filters[f].name}</label>
                                <Select
                                    id={f}
                                    {...filters[f]}
                                    onChange={e => getterSetters[f].set(e)}
                                    value={getterSetters[f].get}
                                />
                            </>)
                }
            </div>

            <Table
                data={data}
                columns={
                    Object.keys(data[0] || {}).map(c => ({
                        Header: c,
                        accessor: c,
                        align: 'center'
                    }))
                }
                initialPageSize={50}
                />
        </div>
    )
}

export default NpmrdsTable