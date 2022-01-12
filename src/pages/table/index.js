import React, {useEffect, useMemo, useState} from "react"
import get from 'lodash.get'
import {useFalcor, withAuth} from '@availabs/avl-components'
import TigLayout from 'components/tig/TigLayout'
import {useParams} from "react-router-dom";
import {tables} from "./tables";

const Table = withAuth(({ mapOptions,layers,views}) => {
    const {falcor, falcorCache} = useFalcor();
    const {viewId} = useParams();
    const [layer, setLayer] = useState([]);
    const [name, setName] = useState([]);

    useEffect(() => {
        falcor.get([ "tig", "byViewId", viewId, ['layer', 'name']])
    }, [viewId])

    useMemo(() => {
        console.log('layer, name', falcorCache)
        let l = get(falcorCache, [ "tig", "byViewId", viewId, 'layer', 'value'], null)
        let n = get(falcorCache, [ "tig", "byViewId", viewId, 'name', 'value'], null)
        if(l && !layer.length) {
            setLayer(l)
            setName(n)
        }
    }, [viewId, falcorCache])

    const CurrTable = get(tables, [layer], () => <></>)
    return (
        <TigLayout>
            <div className='w-full flex-1 flex'>   
                <CurrTable name={name}/>
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
