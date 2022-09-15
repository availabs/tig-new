import React, {useEffect, useMemo, useState} from "react"
import get from 'lodash.get'
import {useFalcor, withAuth} from 'components/avl-components/src'
import TigLayout from 'components/tig/TigLayout'
import {useParams} from "react-router-dom";
import {tables} from "./tables";

const Table = withAuth(({ mapOptions,layers,views}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams();
    const [layer, setLayer] = useState([]);
    const [name, setName] = useState([]);
    const [sourceName, setSourceName] = useState([]);

    useEffect(() => {
        falcor.get([ "tig", "byViewId", viewId, ['layer', 'name']],
            ['tig', 'byViewId', viewId, ['name', 'source_id']]
        ).then(d => {
            let sourceId = get(d, ['json', 'tig', 'byViewId', viewId, 'source_id', 'value'])
            if(!sourceId) return Promise.resolve()
            return falcor.get(['tig', 'datasources', 'byId', sourceId, 'name'])
        })
    }, [viewId])

    useMemo(() => {
        let sourceId = get(falcorCache, ['tig', 'byViewId', viewId, 'source_id', 'value']);
        setSourceName(get(falcorCache, ['tig', 'datasources', 'byId', sourceId, 'name', 'value']))
        let l = get(falcorCache, [ "tig", "byViewId", viewId, 'layer', 'value'], null)
        let n = get(falcorCache, [ "tig", "byViewId", viewId, 'name', 'value'], null)
        if(l && !layer.length) {
            setLayer(l)
            setName(n)
        }

        if(n) {
            setName(n)
        }
    }, [viewId, falcorCache])

    const CurrTable = get(tables, [layer], () => <></>);

    return (
        <TigLayout>
            <div className='w-full flex-1 flex'>   
                <CurrTable name={name} type={layer} sourceName={sourceName} vid={viewId} searchId={window.location.href.split('search=')[1]} />
            </div>
        </TigLayout>
    )
})


const TablePage  = {
    path: `/views/:viewId/table`,
    mainNav: false,
    name: "TIG Table",
    exact: true,
    // authLevel: 0,
    layout: 'Simple',
    component: Table
}

export default TablePage;
