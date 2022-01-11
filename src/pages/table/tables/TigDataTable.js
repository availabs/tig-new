import {useState, useMemo, useEffect} from 'react'
import {Select, Input, Table, useFalcor} from '@availabs/avl-components'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";
import {HOST} from "../../map/layers/layerHost";
import fetcher from "../../map/wrappers/fetcher";
import {useParams} from "react-router-dom";
import _ from "lodash";

const columns = ['tip id', 'project type', 'cost', 'mpo name', 'county', 'agency', 'description', 'actions']

const fetchGeo = (falcor, states) => {
    return falcor.get(["geo", states, "geoLevels"])
}

const fetchData = (dataset) => {
    const url = `${HOST}views/${dataset}/table.json`
    const params = len => `?draw=1&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=6&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=7&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc&start=0&length=${len}&search%5Bvalue%5D=&search%5Bregex%5D=false&_=1641916669262`
    return fetcher(url + params(5)).then(res => fetcher(url + params(res.recordsFiltered || 500)))
}

const processData = (data) => {
    data = data
        .map(row => {
        return row.reduce((acc, r, rI) => {
            acc[columns[rI]] = columns[rI] === 'taz' ? r : r
            return acc
        }, {})
    }, [])
    return data
}

const RenderTable = (data = [], pageSize) => useMemo(() =>
    <Table
        data={data}
        columns={
           columns
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

const SedTaz2055DataTable = () => {
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

    const states = ["36","34","09","42"];

    useEffect(() => fetchGeo(falcor, states), []);

    useEffect(async () => {
        setLoading(true)
        let d = await fetchData(viewId)
        setData(processData(get(d, 'data', [])))
        setLoading(false)

    }, []);

    const config = {
    }
    return (
        <div className='w-full'>
            <div> 2014-2018 TIP Mappable Projects : </div>

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