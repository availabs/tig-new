import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";
import {HOST} from "../../map/layers/layerHost";
import fetcher from "../../map/wrappers/fetcher";
import {useParams} from "react-router-dom";
import _ from "lodash";

const columns = {
    tip_id: 'tip id', ptype: 'project type', cost: 'cost', mpo: 'mpo name', name: 'county', sponsor: 'agency', description: 'description', actions: 'actions'
}

const fetchData = (view, falcor) => {
    return falcor.get(["tig", 'tip', "byId", view, 'data_overlay']).then(d => get(d, ['json', "tig", 'tip', "byId", view, 'data_overlay'],[]))
}

const processData = (data, searchId, viewId) => {
    data = data
        .filter(r => !searchId || r.tip_id === searchId)
        .map(row => {
        return Object.keys(row).reduce((acc, r, rI) => {

            acc[columns[r]] = row[r]
            return acc
        }, {actions: `/views/${viewId}/map?search=${row.tip_id}`})
    }, [])
    return data
}

const RenderTable = (data = [], pageSize) => useMemo(() =>
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

const SedTaz2055DataTable = ({name, searchId}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pageSize, setPageSize] = useState(50)

    const [geography, setGeography] = useState('All')

    const getterSetters = {
        geography: {get: geography, set: setGeography},
        pageSize: {get: pageSize, set: setPageSize},
    }

    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(viewId, falcor)
        setData(processData(d, searchId, viewId))
        setLoading(false)

    }, []);

    const config = {
    }
    return (
        <div className='w-full'>
            <div> {name} : </div>

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

export default SedTaz2055DataTable