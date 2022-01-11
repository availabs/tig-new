import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";
import {HOST} from "../../map/layers/layerHost";
import fetcher from "../../map/wrappers/fetcher";
import {useParams} from "react-router-dom";

const fetchGeo = (falcor, states) => {
    return falcor.get(["geo", states, "geoLevels"])
}

const fetchData = (dataset, rtp_id='Select All', year='Select All', project_type='Select All', plan_portion='Select All', sponsor='Select All') => {
    const url = `${HOST}/views/${dataset}/table.json`
    const params = (len) => `?length=${len}&_=1640813298306`
    return fetcher(url).then(res => fetcher(url + params(res.recordsFiltered || 50)))
}

const processData = (data) => {
    const columns = ['rtp id', 'description', 'year', 'estimated cost', 'project type', 'plan portion', 'sponsor', 'county', 'actions']
    data = data.map(row => {
        return row.reduce((acc, r, rI) => {
            acc[columns[rI]] = r
            return acc
        }, {})
    }, [])
    return data
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

const RtpProjectDataTable = ({name}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [geography, setGeography] = useState('All')
    const [year, setYear] = useState(2019)
    const [month, setMonth] = useState(1)
    const [hour, setHour] = useState(15)
    const [dow, setDow] = useState('Thursday')
    const [vehicles, setVehicles] = useState('All Vehicles')
    const [pageSize, setPageSize] = useState(50)
    const [speedFrom, setSpeedFrom] = useState(0)
    const [speedTo, setSpeedTo] = useState(100)

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
    }

    const states = ["36","34","09","42"];

    useEffect(() => fetchGeo(falcor, states), []);

    useEffect(async () => {
        let d = await fetchData(viewId)
        setData(processData(get(d, 'data', [])))
    }, []);
    console.log('data', data)
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

export default RtpProjectDataTable