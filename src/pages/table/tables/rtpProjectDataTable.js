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

const columns = {rtp_id: 'rtp id', description: 'description', year: 'year', estimated_cost: 'estimated cost', ptype: 'project type', plan_portion: 'plan portion', sponsor: 'sponsor', name: 'county', actions: 'actions'}


const fetchData = (view, falcor) => {
    return falcor.get(["tig", 'rtp_project_data', "byId", view, 'data_overlay']).then(d => get(d, ['json', "tig", 'rtp_project_data', "byId", view, 'data_overlay'],[]))
}

const processData = (data, searchId, viewId, geography) => {
    data = data
        .filter(r => !searchId || r.rtp_id === searchId)
        .map(row => {
            return Object.keys(row).reduce((acc, r, rI) => {
                acc[columns[r]] = row[r]
                return acc
            }, {actions: `/views/${viewId}/map?search=${row.rtp_id}`})
        }, [])
        .filter(entry => !get(counties.filter(c => c.name === entry.county), [0]) ||
            get(filters.geography.domain.filter(geo => geo.name === geography), [0, 'value'], [])
                .includes(counties.filter(c => c.name === entry.county)[0].geoid)
        )
    return data
}

const RenderTable = (data, pageSize, filteredColumns) => useMemo(() =>
    <Table
        data={data}
        columns={
            Object.values(columns)
                .filter(c => !filteredColumns.includes(c))
                .map(c => ({
                    Header: c,
                    accessor: c,
                    align: ['estimated cost'].includes(c) ? 'right' : 'left',
                    filter: ['project type', 'plan portion', 'county', 'year'].includes(c) ? 'dropdown' : null,
                    filterThemeOptions: {size: 'tableMini'},
                    filterClassName: 'w-full text-sm z-50',
                    Cell: d => c === 'estimated cost' ? d.value && `$${d.value} M` : d.value
                }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize, filteredColumns])

const RtpProjectDataTable = ({name, type, searchId}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [geography, setGeography] = useState('All')
    const [pageSize, setPageSize] = useState(50)
    const [filteredColumns, setFilteredColumns] = useState([])

    const getterSetters = {
        geography: {get: geography, set: setGeography},
        pageSize: {get: pageSize, set: setPageSize},
    }

    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(viewId, falcor)
        setData(processData(d, searchId, viewId, geography))
        setLoading(false)

    }, [viewId, searchId, geography]);
console.log('name?', `${type.split('_').join(' ')}: ${name.replace('_', '')}`, name)
    return (
        <div className='w-full'>
            <div className={'font-light text-lg'}> {name} </div>

            <div className={`w-5 flex pb-1 text-xs`}>
                <label  className={`self-center px-1 font-bold text-xs`}>Area:</label>
                <Select
                    id={'geography'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    {...filters.geography}
                    onChange={e => getterSetters.geography.set(e)}
                    value={getterSetters.geography.get}
                /> <span  className={`self-center px-1 font-bold text-xs`}>Data</span>
            </div>

            <div className={'flex flex-row pb-5 items-center w-1/2 text-xs'}>
                <label  className={`px-1 font-bold text-xs`}>Show:</label>
                <Select
                    id={'pageSize'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    domain={[10, 25, 50, 100]}
                    onChange={e => getterSetters.pageSize.set(e)}
                    value={pageSize}
                    multi={false}
                /><span  className={`px-1 font-bold text-xs`}>entries</span>

                <MoreButton className={'pl-3'}
                            data={data || []}
                            columns={Object.values(columns)}
                            filteredColumns={filteredColumns} setFilteredColumns={setFilteredColumns}
                            filename={`${type.split('_').join(' ')}: ${name.trim()}`}
                />
            </div>
            {loading ? <div>Processing...</div> : ''}
            <div className='w-full overflow-x-scroll scrollbar font-sm'>
                {RenderTable(data, pageSize, filteredColumns)}
            </div>
        </div>
    )
}

export default RtpProjectDataTable