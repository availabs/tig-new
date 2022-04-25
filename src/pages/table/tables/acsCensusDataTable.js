import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import {useParams} from "react-router-dom";
import _ from "lodash";
import counties from "../../map/config/counties.json";

const fetchData = (falcor,viewId) => {
    return falcor.get(["tig", "acs_census", "byId", viewId, 'data_overlay'], ['tig', 'source', 'acs_census', 'view', viewId])
        .then(d => get(d , ['json', 'tig', 'source', 'acs_census', 'view', viewId], {}))
}

const processData = (data, viewId, valueColumn, upper, lower, nameMapping, geography) => {
    // 128, 143, 133, 18

    data = Object.values(data)
        .map(row => {
                return Object.keys(row)
                    .filter(r => !['type', 'view_id', 'gid'].includes(r))
                    .reduce((acc, r, rI) => {
                    // acc[columns[rI]] = columns[rI] === 'county' ? r : +r
                    if(r === 'area'){
                        acc['county'] = row[r].split(':')[0];
                        acc['census tract'] = row[r].split(':')[1];
                    }else{
                        acc[nameMapping[r] || r] = row[r];
                    }
                    return acc
                }, {})
    }, [])
        .filter(entry =>
            get(filters.geography.domain.filter(geo => geo.name === geography), [0, 'value'], [])
                .includes(counties.filter(c => c.name === entry.county)[0].geoid)
        )
        .filter(d => {
            return !(valueColumn && (upper || lower)) || ((!lower || (d[valueColumn] >= lower)) && (!upper || d[valueColumn] <= upper))
        })
    return data
}

const RenderTable = (data = [], pageSize, valueColumn, lower, upper) => useMemo(() =>
    <Table
        data={data}
        columns={
            Object.keys(data[0] || {})
                .map(c => ({
                    Header: c,
                    accessor: c,
                    align: 'center',
                    disableFilters: c !== 'county'
                }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize])

const AcsCensusDataTable = ({name}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams();

    const nameMapping = {
        value: 'population',
        base_value: ['128', '143', '133', '18'].includes(viewId) ? 'population below poverty' : 'minority population',
        percentage: ['128', '143', '133', '18'].includes(viewId) ? 'percent below poverty' : 'percent minority'
    }

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pageSize, setPageSize] = useState(50)

    const [geography, setGeography] = useState('All')
    const [column, setColumn] = useState(nameMapping["base_value"])
    const [lower, setLower] = useState()
    const [upper, setUpper] = useState()

    const getterSetters = {
        geography: {get: geography, set: setGeography},
        column: {get: column, set: setColumn},
        lower: {get: lower, set: setLower},
        upper: {get: upper, set: setUpper},
        pageSize: {get: pageSize, set: setPageSize},
    }


    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(falcor, viewId)
        setData(processData(d, viewId, column, upper, lower, nameMapping, geography))
        setLoading(false)

    }, [viewId, column, lower, upper, geography]);
    const config = {
        column: {
            name: 'Column',
            type: "select",
            multi: false,
            domain: [
                nameMapping["percentage"],
                nameMapping["base_value"]
            ],
            value: column
        },
    }
    return (
        <div className='w-full'>
            <div> {name} </div>

            <div className={`pt-3 flex pb-3`}>
                <label  className={`self-center px-1 font-bold text-sm`}>Area:</label>
                <Select
                    id={'geography'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    color={'transparent'}
                    className={'text-sm'}
                    {...filters.geography}
                    onChange={e => getterSetters.geography.set(e)}
                    value={getterSetters.geography.get}
                /> <span  className={`self-center px-1 font-bold text-sm`}>Data</span>
            </div>

            <div className={`flex pb-5 items-center`}>
                {
                    Object.keys(config)
                        .map(f =>
                        <>
                            <label  className={`self-center px-1 font-bold text-sm whitespace-nowrap`}>{config[f].name}:</label>
                            <Select
                                id={f}
                                themeOptions={{
                                    size: 'compact'
                                }}
                                color={'transparent'}
                                className={'text-sm whitespace-nowrap'}
                                {...config[f]}
                                onChange={e => getterSetters[f].set(e)}
                                value={getterSetters[f].get}
                            />
                        </>)
                }
                <label  className={`px-1 pl-5 font-bold text-sm`}>From:</label>
                <Input type='number' id={'lower'} value={lower} onChange={setLower} large />
                <label  className={`px-1 font-bold text-sm`}>To:</label>
                <Input type='number' id={'upper'} value={upper} onChange={setUpper} large />

                <label  className={`px-1 font-bold text-sm`}>Show:</label>
                <Select
                    id={'pageSize'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    color={'transparent'}
                    className={'text-sm'}
                    domain={[10, 25, 50, 100]}
                    onChange={e => getterSetters.pageSize.set(e)}
                    value={pageSize}
                    multi={false}
                /><span  className={`px-1 font-bold text-sm`}>entries</span>
            </div>

            {loading ? <div>Processing...</div> : ''}
            <div className='w-full overflow-x-scroll scrollbar font-sm'>
                {RenderTable(data, pageSize, column, lower, upper)}
            </div>
        </div>
    )
}

export default AcsCensusDataTable