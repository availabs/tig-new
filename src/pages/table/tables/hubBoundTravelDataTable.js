import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from 'components/avl-components/src'
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

const fetchYears = async (falcor, type, viewId) => {
    return falcor.get(["tig", type, "byId", viewId, 'years']).then(d => get(d, ['json', "tig", type, "byId", viewId, 'years']))
}
const fetchData = async (falcor, type, viewId, year) => {
    return falcor.get(["tig", type, "byId", viewId, 'byYear', year, 'data_overlay'])
        .then(d => {
            return Array.isArray(year) ?
                year.reduce((acc, y) => [...acc,  ...get(d, ['json', "tig", type, "byId", viewId, 'byYear', y, 'data_overlay'])], []) :
                get(d, ['json', "tig", type, "byId", viewId, 'byYear', year, 'data_overlay'])
        })
}


const processData = (data) => {
    console.log('pd', data)
    data = data.map(row => ({...row, 'hour': `${row.hour}:00 - ${row.hour + 1}:00`} ))
    return data
}
const RenderTable = (data = [], pageSize, filteredColumns, year, years, setYear) => useMemo(() =>
    <Table
        data={data}
        columns={
            Object.keys(columns)
                .filter(c => !filteredColumns.includes(columns[c]))
                .map(c => ({
                    Header: columns[c] || c,
                    accessor: c,
                    align: ['year', 'count'].includes(c) ? 'right' : c === 'hour' ? 'center' : 'left',
                    filter: ['year', 'var_name', 'route_name', 'mode_name', 'in_station_name', 'direction', 'loc_name', 'sector_name', 'transit_agency'].includes(c) ? 'dropdown' : null,
                    filterDomain: c === 'year' ? years : null,
                    customValue: c === 'year' ? year : null,
                    onFilterChange: c === 'year' ? (p) => setYear(p) : null,
                    filterThemeOptions: {size: 'mini'},
                    filterClassName: 'w-full text-sm z-50',
                    maxWidth: 200,
                    minWidth: 170,
                    width: 170
            }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize, filteredColumns, year, years])

const HubBoundTravelDataTable = ({name, type}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams()
    const [loading, setLoading] = useState(false)
    const [year, setYear] = useState(2013)
    const [years, setYears] = useState([year])
    const [data, setData] = useState([])
    const [pageSize, setPageSize] = useState(50)
    const [filteredColumns, setFilteredColumns] = useState([])

    const getterSetters = {
        pageSize: {get: pageSize, set: setPageSize},
    }

    useEffect(async () => {
        setLoading(true)
        setData([])
        let years = await fetchYears(falcor, type, viewId)
        setYears(years)
        let d = await fetchData(falcor, type, viewId, year || years)
        setLoading(false)
        setData(processData(d || []))
    }, [viewId, year, years]);

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
                            filteredColumns={filteredColumns} setFilteredColumns={setFilteredColumns}
                            filename={`${type.split('_').join(' ')}: ${name}`}
                />
            </div>
            {loading ? <div>Processing...</div> : ''}
            <div className='w-full overflow-x-scroll scrollbar'>
                {RenderTable(data, pageSize, filteredColumns, year, years, setYear)}
            </div>
        </div>
    )
}

export default HubBoundTravelDataTable