import React,{useMemo} from "react"
import { Legend } from "@availabs/avl-components";

const LegendContainer = ({activeLayers, ...props}) => {
    return (
        <div className=' w-full px-4'>
            <h4 className='text-lg font-medium'>Legends</h4>
            {
                activeLayers.map((layer,i) => <LegendComp key={i} layer={layer} /> )
            }
        </div>
    )
}

const LegendComp = ({layer}) => {
    const {legend} = layer
    return (
        <div className='bg-white p-2 rounded w-full my-1'>
            <h4 className='text-lg font-medium'>{layer.name}</h4>
            <h4 className='text-md font-medium'>{legend.units}</h4>
            {
                legend.domain.map((d,i) =>
                    <div className=' flex align-baseline'>
                        <div style={{backgroundColor: legend.range[i], width:20, height:20, display:'inline-block' }} className='m-1'/>
                        <div className='flex-1 pl-2'>{d} - {legend.domain[i+1]}</div>
                    </div>
                )
            }
        </div> 
    )
}

export default LegendContainer