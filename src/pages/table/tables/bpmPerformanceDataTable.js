import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";
import {HOST} from "../../map/layers/layerHost";
import fetcher from "../../map/wrappers/fetcher";
import {useParams} from "react-router-dom";
import counties from "../../map/config/counties.json";
import MoreButton from "./components/moreButton";

const mapping = {
    name: 'county',
    vehicle_miles_traveled: 'vmt (in thousands)',
    vehicle_hours_traveled: 'vht (in thousands)',
    avg_speed: 'avg. speed (milers/hr)',
}

const fetchData = (falcor, viewId, type) => {
    return falcor.get(["tig", type, "byId", viewId, 'data_overlay'])
        .then(response => {
            return get(response, ['json', "tig", type, "byId", viewId, 'data_overlay'], [])
        })
}

const processData = (data, viewId, column, upper, lower, geography, timePeriod, functionalClass) => {

    return data
        .filter(d => {
                return d.period === timePeriod && d.functional_class === functionalClass &&
                    ((!lower || d[column] >= lower) && (!upper || d[column] <= upper))
            }
        )
        .filter(entry => !get(counties.filter(c => c.name === entry.name), [0]) ||
            get(filters.geography.domain.filter(geo => geo.name === geography), [0, 'value'], [])
                .includes(counties.filter(c => c.name === entry.name)[0].geoid)
        )
        .sort((a,b) => b.name.localeCompare(a.name))
}

const RenderTable = (data, pageSize, filteredColumns) => useMemo(() =>
    <Table
        data={data}
        columns={
            Object.keys(mapping)
                .filter(c => !filteredColumns.includes(mapping[c]))
                .map(c => ({
                    Header: mapping[c],
                    accessor: c,
                    align: c === 'name' ? 'left' : 'right',
                    filterLocation: 'inline',
                    Cell: (d) => c === 'avg_speed' ? d.value.toFixed(2) : (d.value || 0).toLocaleString(),
                    disableFilters: c !== 'name'
                }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize, filteredColumns])

const BpmPerformanceDataTable = ({name, type}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pageSize, setPageSize] = useState(50)

    const [geography, setGeography] = useState('All')
    const [timePeriod, setTimePeriod] = useState(0)
    const [functionalClass, setFunctionalClass] = useState(0)
    const [column, setColumn] = useState('vehicle_miles_traveled')
    const [lower, setLower] = useState()
    const [upper, setUpper] = useState()
    const [filteredColumns, setFilteredColumns] = useState([])



    const getterSetters = {
        geography: {get: geography, set: setGeography},
        timePeriod: {get: timePeriod, set: setTimePeriod},
        functionalClass: {get: functionalClass, set: setFunctionalClass},
        column: {get: column, set: setColumn},
        lower: {get: lower, set: setLower},
        upper: {get: upper, set: setUpper},
        pageSize: {get: pageSize, set: setPageSize},
    }

    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(falcor, viewId, type)
        setLoading(false)
        console.log('d?', d.data)
        setData(processData(d, viewId, column, upper, lower, geography, timePeriod, functionalClass))
    }, [viewId, timePeriod, functionalClass, column, lower, upper, geography]);

    const config = {
        timePeriod: {
            name: 'Time Period',
            type: "select",
            multi: false,
            domain: [{name: 'All Day', value: 0}, {name: 'AM Peak', value: 1}, {name: 'Midday', value: 2}, {name: 'PM Peak', value: 3}, {name: 'Night', value: 4}],
            value: timePeriod,
            accessor: d => d.name,
            valueAccessor: d => d.value,
        },
        functionalClass: {
            name: 'Functional Class',
            type: "select",
            multi: false,
            domain: [{name: 'Total', value: 0}, {name: 'Highway', value: 1}, {name: 'Arterial', value: 2}, {name: 'Local', value: 3}, {name: 'Ramps', value: 4}, {name: 'Other', value: 5}],
            value: functionalClass,
            accessor: d => d.name,
            valueAccessor: d => d.value,
        },
        column: {
            name: 'Column',
            type: "select",
            multi: false,
            domain: [{name: 'VMT (in thousands)', value: 'vehicle_miles_traveled'}, {name: 'VHT (in thousands)', value: 'vehicle_hours_traveled'}, {name: 'Avg. Speed (milers/hr)', value: 'avg_speed'}],
            value: column,
            accessor: d => d.name,
            valueAccessor: d => d.value,
        },
    }
    return (
        <div className='w-full'>
            <div className={'font-light text-lg'}> {name} </div>

            <div className={`flex pb-4 pt-1.5`}>
                <label  className={`self-center px-1 font-bold text-xs`}>Area:</label>
                <Select
                    id={'geography'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    className={'font-light text-sm'}
                    {...filters.geography}
                    onChange={e => getterSetters.geography.set(e)}
                    value={getterSetters.geography.get}
                /> <span  className={`self-center px-1 capitalize font-semibold text-xs`}>Data</span>
            </div>

            <div className={`flex pb-3 items-center`}>
                {
                    Object.keys(config)
                        .map(f =>
                        <>
                            <label  className={`self-center px-1 whitespace-nowrap text-xs font-bold`}>{config[f].name}:</label>
                            <Select
                                id={f}
                                themeOptions={{
                                    size: 'compact'
                                }}
                                className={'whitespace-nowrap text-sm'}
                                {...config[f]}
                                onChange={e => getterSetters[f].set(e)}
                                value={getterSetters[f].get}
                            />
                        </>)
                }
                <label  className={`px-1 text-xs`}>From:</label>
                <Input
                       type='text'
                       id={'lower'}
                       value={lower}
                       onChange={setLower}
                       placeholder={''}
                       themeOptions={{
                           size: 'small',
                           color: 'white'
                       }}
                />
                <label  className={`px-1 ml-3 text-xs`}>To:</label>
                <Input type='text' id={'upper'} value={upper} onChange={setUpper} placeholder={''}/>
            </div>

            <div className={'flex flex-row pb-5 items-center w-1/2'}>
                <label  className={`px-1 text-sm`}>Show:</label>
                <Select
                    id={'pageSize'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    domain={[10, 25, 50, 100]}
                    onChange={e => getterSetters.pageSize.set(e)}
                    value={pageSize}
                    multi={false}
                /><span  className={`px-1 text-sm`}>entries</span>

                <MoreButton className={'pl-3'}
                            data={data}
                            columns={Object.values(mapping)}
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

export default BpmPerformanceDataTable