import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import _ from 'lodash'
import flatten from "lodash.flatten";
import {HOST} from "../../map/layers/layerHost";
import fetcher from "../../map/wrappers/fetcher";
import {useParams} from "react-router-dom";
import MoreButton from "./components/moreButton";

const columns = {
    'year': 'year',
    'var_name': 'count variables',
    'count': 'count',
    'route_name': 'route',
    'mode_name': 'mode',
    'in_station_name': 'in station',
    'out_station_name': 'out station',
    'direction': 'direction',
    'loc_name': 'location',
    'sector_name': 'sector',
    'hour': 'from - to',
    'transit_agency': 'transit agency'
}

const fetchData = async (falcor, type, viewId) => {
    return falcor.get(["tig", type, "byId", viewId, 'data_overlay']).then(d => get(d, ['json', "tig", type, "byId", viewId, 'data_overlay']))
}


const processData = (data) => {
    data = data.map(row => ({...row, 'hour': `${row.hour}:00 - ${row.hour + 1}:00`} ))
    return data
}
const RenderTable = (data = [], pageSize, filteredColumns) => useMemo(() =>
    <Table
        data={data}
        columns={
            Object.keys(columns)
                .filter(c => !filteredColumns.includes(columns[c]))
                .map(c => ({
                    Header: columns[c] || c,
                    accessor: c,
                    align: 'center',
                    filter: ['year', 'var_name', 'route_name', 'mode_name', 'in_station_name', 'direction', 'loc_name', 'sector_name', 'transit_agency'].includes(c) ? 'dropdown' : null,
                    filterThemeOptions: {size: 'tableMini'},
                    filterClassName: 'w-full text-sm z-50',
            }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize, filteredColumns])

const HubBoundTravelDataTable = ({name, type}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pageSize, setPageSize] = useState(50)
    const [filteredColumns, setFilteredColumns] = useState([])

    const getterSetters = {
        pageSize: {get: pageSize, set: setPageSize},
    }

    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(falcor, type, viewId)
        setLoading(false)
        setData(processData(d || []))
    }, [viewId]);

    return (
        <div className='w-full'>
            <div className={'font-light text-lg'}> {name} </div>

            <div className={'pb-4 pt-4 flex flex-row items-center w-1/2 text-xs'}>
                <label  className={`px-1text-sm`}>Show:</label>
                <Select
                    id={'pageSize'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    domain={[10, 25, 50, 100]}
                    onChange={e => getterSetters.pageSize.set(e)}
                    value={pageSize}
                    multi={false}
                /><span  className={`px-1`}>entries</span>

                <MoreButton className={'pl-3'}
                            data={data || []}
                            columns={Object.values(columns)}
                            filteredColumns={filteredColumns} setFilteredColumns={setFilteredColumns}/>
            </div>
            {loading ? <div>Processing...</div> : ''}
            <div className='w-full overflow-x-scroll scrollbar'>
                {RenderTable(data, pageSize, filteredColumns)}
            </div>
        </div>
    )
}

export default HubBoundTravelDataTable