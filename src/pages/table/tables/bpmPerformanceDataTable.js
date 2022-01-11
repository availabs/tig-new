import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";
import {HOST} from "../../map/layers/layerHost";
import fetcher from "../../map/wrappers/fetcher";
import {useParams} from "react-router-dom";

const mapping = {
    area: 'county',
    vehicle_miles_traveled: 'vmt (in thousands)',
    vehicle_hours_traveled: 'vht (in thousands)',
    avg_speed: 'avg. speed (milers/hr)',
}
const fetchGeo = (falcor, states) => {
    return falcor.get(["geo", states, "geoLevels"])
}

const fetchData = (dataset, period = 0, functional_class = 0, value_column = '', lower = '', upper = '') => {
    const url = `${HOST}/views/${dataset}/data_overlay`
    const params = `?utf8=%E2%9C%93&period=${period}&functional_class=${functional_class}&value_column=${value_column}&lower=${lower}&upper=${upper}`
    return fetcher(url + params)
}

const RenderTable = (data, pageSize) => useMemo(() =>
    <Table
        data={data}
        columns={
            Object.keys(mapping)
                .map(c => ({
                    Header: mapping[c],
                    accessor: c,
                    align: 'center'
                }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize])

const BpmPerformanceDataTable = () => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pageSize, setPageSize] = useState(50)

    const [geography, setGeography] = useState('All')
    const [timePeriod, setTimePeriod] = useState(0)
    const [functionalClass, setFunctionalClass] = useState(0)
    const [column, setColumn] = useState()
    const [lower, setLower] = useState()
    const [upper, setUpper] = useState()


    const getterSetters = {
        geography: {get: geography, set: setGeography},
        timePeriod: {get: timePeriod, set: setTimePeriod},
        functionalClass: {get: functionalClass, set: setFunctionalClass},
        column: {get: column, set: setColumn},
        lower: {get: lower, set: setLower},
        upper: {get: upper, set: setUpper},
        pageSize: {get: pageSize, set: setPageSize},
    }

    const states = ["36","34","09","42"];

    useEffect(() => fetchGeo(falcor, states), []);

    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(viewId, timePeriod, functionalClass, column, lower, upper)
        setLoading(false)
        setData(get(d, 'data', []))
    }, [timePeriod, functionalClass, column, lower, upper]);

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
            domain: [{name: 'vmt (in thousands)', value: 'vehicle_miles_traveled'}, {name: 'vht (in thousands)', value: 'vehicle_hours_traveled'}, {name: 'avg. speed (milers/hr)', value: 'avg_speed'}],
            value: column,
            accessor: d => d.name,
            valueAccessor: d => d.value,
        },
    }
    return (
        <div className='w-full'>
            <div> 2010 base: </div>

            <div className={`w-5 flex pb-1`}>
                <label  className={`self-center px-1 font-bold text-sm`}>Area:</label>
                <Select
                    id={'geography'}
                    {...filters.geography}
                    onChange={e => getterSetters.geography.set(e)}
                    value={getterSetters.geography.get}
                /> <span  className={`self-center px-1 font-bold text-sm`}>Data</span>
            </div>

            <div className={`flex pb-1 items-center`}>
                {
                    Object.keys(config)
                        .map(f =>
                        <>
                            <label  className={`self-center px-1 font-bold text-sm whitespace-nowrap`}>{config[f].name}:</label>
                            <Select
                                id={f}
                                className={'whitespace-nowrap'}
                                {...config[f]}
                                onChange={e => getterSetters[f].set(e)}
                                value={getterSetters[f].get}
                            />
                        </>)
                }
                <label  className={`px-1 font-bold text-sm`}>from:</label>
                <Input type='number' id={'lower'} value={lower} onChange={setLower} large />
                <label  className={`px-1 font-bold text-sm`}>to:</label>
                <Input type='number' id={'upper'} value={upper} onChange={setUpper} large />
            </div>

            <div className={'flex flex-row pb-5 items-center w-1/2'}>
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

export default BpmPerformanceDataTable