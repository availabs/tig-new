import React, {useMemo} from "react"
import get from 'lodash.get'
import { withAuth } from '@availabs/avl-components'
import TigLayout from 'components/tig/TigLayout'
import {useParams} from "react-router-dom";
import routingConfig from "../map/routing-config/routingConfig.json";
import {tables} from "./tables";

const Table = withAuth(({ mapOptions,layers,views}) => {
    const {viewId} = useParams();

    const CurrTable = useMemo(() => {
        let layerVal = get(routingConfig.filter(c => c.value === viewId), [0, 'layer'],  '')

        return tables[layerVal]

    }, [viewId,layers])

    return (
        <TigLayout>
            <div className='w-full flex-1 flex'>   
                <CurrTable />
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
