import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";
import {HOST} from "../../map/layers/layerHost";
import fetcher from "../../map/wrappers/fetcher";
import {useParams} from "react-router-dom";

const columns = {rtp_id: 'rtp id', description: 'description', year: 'year', estimated_cost: 'estimated cost', ptype: 'project type', plan_portion: 'plan portion', sponsor: 'sponsor', name: 'county', actions: 'actions'}


const fetchData = (view, falcor) => {
    return falcor.get(["tig", 'rtp_project_data', "byId", view, 'data_overlay']).then(d => get(d, ['json', "tig", 'rtp_project_data', "byId", view, 'data_overlay'],[]))
}

const processData = (data, searchId, viewId) => {
    data = data
        .filter(r => !searchId || r.rtp_id === searchId)
        .map(row => {
            return Object.keys(row).reduce((acc, r, rI) => {
                acc[columns[r]] = row[r]
                return acc
            }, {actions: `/views/${viewId}/map?search=${row.rtp_id}`})
        }, [])
    console.log(data)
    return data
}

const RenderTable = (data, pageSize) => useMemo(() =>
    <Table
        data={data}
        columns={
            Object.values(columns)
                .map(c => ({
                    Header: c,
                    accessor: c,
                    align: 'center'
                }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize])

const RtpProjectDataTable = ({name, searchId}) => {
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

    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(viewId, falcor)
        setData(processData(d, searchId, viewId))
        setLoading(false)

    }, []);

    return (
        <div className='w-full'>
            <div className={'font-light text-lg'}> {name} </div>

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