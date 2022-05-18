import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import {useParams} from "react-router-dom";
import _ from "lodash";
import counties from "../../map/config/counties.json";
import MoreButton from "./components/moreButton";

const fetchData = (falcor,viewId) => {
    return falcor.get(['tig', 'source', 'acs_census', 'view', viewId])
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
        .filter(entry => !get(counties.filter(c => c.name === entry.county), [0]) ||
            get(filters.geography.domain.filter(geo => geo.name === geography), [0, 'value'], [])
                .includes(counties.filter(c => c.name === entry.county)[0].geoid)
        )
        .filter(d => {
            return !(valueColumn && (upper || lower)) || ((!lower || (d[valueColumn] >= lower)) && (!upper || d[valueColumn] <= upper))
        })
        .sort((a,b) => b.county.localeCompare(a.county))
    return data
}

const RenderTable = (data = [], pageSize, filteredColumns = []) => useMemo(() =>
    <Table
        data={data}
        columns={
            Object.keys(data[0] || {})
                .filter(c => !filteredColumns.includes(c))
                .map(c => ({
                    Header: c,
                    accessor: c,
                    align: ['county', 'census tract', 'fips'].includes(c) ? 'left' : 'right',
                    filterLocation: 'inline',
                    disableFilters: c !== 'county',
                    Cell: (d) => c.includes('percent') ? (d.cell.value || 0).toFixed(0) + '%' : (d.cell.value || 0).toLocaleString()
                }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize, filteredColumns])

const AcsCensusDataTable = ({name, type}) => {
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
    const [configDomain, setConfigDomain] = useState([nameMapping.base_value, nameMapping.percentage])
    const [filteredColumns, setFilteredColumns] = useState([])

    const getterSetters = {
        geography: {get: geography, set: setGeography},
        column: {get: column, set: setColumn},
        lower: {get: lower, set: setLower},
        upper: {get: upper, set: setUpper},
        pageSize: {get: pageSize, set: setPageSize},
    }

    let config = {
        column: {
            name: 'Column',
            type: "select",
            multi: false,
            domain: configDomain,
            value: column
        },
    }

    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(falcor, viewId)
        setData(processData(d, viewId, column, upper, lower, nameMapping, geography))
        setConfigDomain([nameMapping.base_value, nameMapping.percentage])
        ![nameMapping.base_value, nameMapping.percentage].includes(column) && setColumn(nameMapping.base_value);
        setLoading(false)

    }, [viewId, column, lower, upper, geography]);

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
                /> <span  className={`self-center px-1 capitalize font-semibold text-xs`}>Census Tract Data</span>
            </div>

            <div className={`flex justify-between pb-3 items-center font-light text-sm`}>
                {
                    Object.keys(config)
                        .map(f =>
                        <>
                            <label  className={`self-center px-1 whitespace-nowrap`}>{config[f].name}:</label>
                            <Select
                                id={f}
                                className={'whitespace-nowrap capitalize'}
                                themeOptions={{
                                    size: 'compact'
                                }}
                                {...config[f]}
                                onChange={e => getterSetters[f].set(e)}
                                value={getterSetters[f].get}
                            />
                        </>)
                }
                <label  className={`px-1 text-xs`}>From:</label>
                <Input className={'shadow-inner focus:drop-shadow-lg border border-gray-300 focus:border-none focus:border-pink-300 p-1'} type='text' id={'lower'} value={lower} onChange={setLower} large />
                <label  className={`px-1 ml-5 text-xs`}>To:</label>
                <Input className={'shadow-inner focus:drop-shadow-lg border border-gray-300 focus:border-gray-300 p-1'} type='text' id={'upper'} value={upper} onChange={setUpper} large />

                <label  className={`ml-10 px-1 text-xs`}>Show:</label>

                <Select
                    id={'pageSize'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    color={'transparent'}
                    className={'font-light text-sm'}
                    domain={[10, 25, 50, 100]}
                    onChange={e => getterSetters.pageSize.set(e)}
                    value={pageSize}
                    multi={false}
                /><span  className={`px-1 text-xs`}>entries</span>

                <MoreButton className={'pl-3'}
                            data={data}
                            columns={Object.keys(data[0] || {})}
                            filteredColumns={filteredColumns} setFilteredColumns={setFilteredColumns}
                            filename={`${type.split('_').join(' ')}: ${name}`}
                />
            </div>

            {loading ? <div>Processing...</div> : ''}
            <div className='w-full overflow-x-scroll scrollbar font-sm'>
                {RenderTable(data, pageSize, filteredColumns)}
            </div>
        </div>
    )
}

export default AcsCensusDataTable