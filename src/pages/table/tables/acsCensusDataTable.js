import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";
import {HOST} from "../../map/layers/layerHost";
import fetcher from "../../map/wrappers/fetcher";
import {useParams} from "react-router-dom";
import _ from "lodash";

const fetchData = (falcor,viewId) => {
    return falcor.get(["tig", "acs_census", "byId", viewId, 'data_overlay'])
}

const processData = (data, viewId) => {
    const nameMapping = {
        value: 'population',
        base_value: ['128', '143', '133', '18'].includes(viewId) ? 'population below poverty' : 'minority population',
        percentage: ['128', '143', '133', '18'].includes(viewId) ? 'percent below poverty' : 'percent minority'
    }
    // 128, 143, 133, 18
    data = data
        .map(row => {
        return Object.keys(row)
            .filter(r => !['type', 'view_id'].includes(r))
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
    return data
}

const RenderTable = (data = [], pageSize, valueColumn, lower, upper) => useMemo(() =>
    <Table
        data={data.filter(d => !(valueColumn && (upper || lower)) || ((!lower || (d[valueColumn] >= lower)) && (!upper || d[valueColumn] <= upper)))}
        columns={
            Object.keys(data[0] || {})
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

const AcsCensusDataTable = ({name}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pageSize, setPageSize] = useState(50)

    const [geography, setGeography] = useState('All')
    const [column, setColumn] = useState()
    const [lower, setLower] = useState()
    const [upper, setUpper] = useState()


    const getterSetters = {
        geography: {get: geography, set: setGeography},
        column: {get: column, set: setColumn},
        lower: {get: lower, set: setLower},
        upper: {get: upper, set: setUpper},
        pageSize: {get: pageSize, set: setPageSize},
    }


    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(falcor, viewId)
        setData(processData(get(d, ['json', "tig", "acs_census", "byId", viewId, 'data_overlay'], []), viewId))
        setLoading(false)

    }, [column, lower, upper]);
    const config = {
        column: {
            name: 'Column',
            type: "select",
            multi: false,
            domain: ['percent minority', 'minority population'],
            value: column
        },
    }
    return (
        <div className='w-full'>
            <div> {name}: </div>

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
                {RenderTable(data, pageSize, column, lower, upper)}
            </div>
        </div>
    )
}

export default AcsCensusDataTable