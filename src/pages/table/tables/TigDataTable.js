import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from 'components/avl-components/src'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";
import {HOST} from "../../map/layers/layerHost";
import fetcher from "../../map/wrappers/fetcher";
import {useParams} from "react-router-dom";
import _ from "lodash";
import counties from "../../map/config/counties.json";
import MoreButton from "./components/moreButton";

const columns = {
    tip_id: 'tip id', ptype: 'project type', cost: 'cost', mpo: 'mpo name', name: 'county', sponsor: 'agency', description: 'description', actions: 'actions'
}

const fetchData = (view, falcor) => {
    return falcor.get(["tig", 'tip', "byId", view, 'data_overlay']).then(d => get(d, ['json', "tig", 'tip', "byId", view, 'data_overlay'],[]))
}

const processData = (data, searchId, viewId, geography) => {

    data = data
        .filter(r => !searchId || r.tip_id === searchId)
        .map(row => {
        return Object.keys(row)
            .reduce((acc, r, rI) => {

            acc[columns[r]] = row[r]
            return acc
        }, {actions: `views/${viewId}/map?search=${row.tip_id}`})
    }, [])
        .filter(entry => !get(counties.filter(c => c.name === entry.name), [0]) ||
            get(filters.geography.domain.filter(geo => geo.name === geography), [0, 'value'], [])
                .includes(counties.filter(c => c.name === entry.name)[0].geoid)
        )
    return data
}

const RenderTable = (data = [], pageSize, filteredColumns) => useMemo(() =>
    <Table
        data={data}
        columns={
           Object.values(columns)
               .filter(c => !filteredColumns.includes(c))
                .map(c => ({
                    Header: c,
                    accessor: c,
                    align: c === 'cost' ? 'right' : 'left',
                    filter: ['project type', 'mpo name', 'county', 'agency'].includes(c) ? 'dropdown' : null,
                    filterThemeOptions: {size: 'mini'},
                    filterClassName: 'w-full text-sm z-50',
                    Cell: d => c === 'cost' ?  `$${d.value} M` : c === 'actions' ? <a href={d.value}>Map</a> : d.value,
                    maxWidth: 170,
                    minWidth: 170,
                    width: 170
                }))
        }
        initialPageSize={pageSize}
        pageSize={pageSize}
        striped={true}
    />, [data, pageSize, filteredColumns])

const SedTaz2055DataTable = ({name, type, searchId}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pageSize, setPageSize] = useState(50)
    const [filteredColumns, setFilteredColumns] = useState([])

    const [geography, setGeography] = useState('All')

    const getterSetters = {
        geography: {get: geography, set: setGeography},
        pageSize: {get: pageSize, set: setPageSize},
    }

    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(viewId, falcor)
        setData(processData(d, searchId, viewId, geography))
        setLoading(false)

    }, [viewId, geography]);

    const config = {
    }
    return (
        <div className='w-full'>
            <div className={'font-light text-lg'}> {name} </div>

            <div className={`w-5 flex pb-1`}>
                <label  className={`self-center px-1 font-bold text-xs`}>Area:</label>
                <Select
                    id={'geography'}
                    themeOptions={{
                        size: 'compact'
                    }}
                    className={'text-sm'}
                    {...filters.geography}
                    onChange={e => getterSetters.geography.set(e)}
                    value={getterSetters.geography.get}
                /> <span  className={`self-center px-1 font-bold text-xs`}>Data</span>
            </div>

            <div className={`flex pb-1 items-center`}>
                {
                    Object.keys(config)
                        .map(f =>
                        <>
                            <label  className={`self-center px-1 font-bold text-xs whitespace-nowrap`}>{config[f].name}:</label>
                            <Select
                                id={f}
                                themeOptions={{
                                    size: 'compact'
                                }}
                                className={'whitespace-nowrap'}
                                {...config[f]}
                                onChange={e => getterSetters[f].set(e)}
                                value={getterSetters[f].get}
                            />
                        </>)
                }
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

export default SedTaz2055DataTable