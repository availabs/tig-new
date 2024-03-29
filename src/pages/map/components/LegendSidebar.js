import React,{useMemo} from "react"
import get from 'lodash.get'
import {format} from "d3-format";

const LegendContainer = ({activeLayers, ...props}) => {
    return (
        <div className=' w-full px-4'>
            <h4 className='text-lg font-medium'>Legends</h4>
            {
                activeLayers.map((layer,i) => get(layer, ['legend', 'icons']) ?
                    <LegendCompIcons key={i} layer={layer} />  :
                    get(layer, ['legend', 'pair']) === 'simple' ?
                        <LegendCompSimple key={i} layer={layer} /> :
                    <LegendCompRange key={i} layer={layer} />
                )
            }
        </div>
    )
}

const LegendCompRange = ({layer}) => {
    const {legend} = layer
    return (
        <div className='bg-white  p-2 rounded w-full my-1'>
            <h4 className='text-lg font-medium'>{layer.name} <span className='text-md font-medium'>{legend.units}</span> </h4>
            {
                legend.domain.filter((d,i) => !isNaN(+d) && i !== legend.domain.length - 1).map((d,i) =>
                    <div key={i} className=' flex align-baseline'>
                        <div style={{backgroundColor: legend.range[i], opacity: 0.55, width:20, height:20, display:'inline-block' }} className='m-1'/>
                        {/*<div className='flex-1 pl-2'>{format(',')(d)} - {format(',')(legend.domain[i+1])}</div>*/}
                        <div className='flex-1 pl-2'>{(d).toLocaleString()} - {(legend.domain[i+1]).toLocaleString()}</div>
                    </div>
                )
            }
        </div> 
    )
}

const LegendCompIcons = ({layer}) => {
    const {legend} = layer
    return (
        <div className='bg-white p-2 rounded w-full my-1'>
            <h4 className='text-lg font-medium'>{layer.name} <span className='text-md font-medium'>{legend.units}</span></h4>
            {
                legend.domain.map((d,i) =>
                    <div key={i} className=' flex align-baseline'>
                        <div style={{backgroundColor: legend.range[i], width:20, height:20, display:'inline-block' }} className='m-1'/>
                        <div style={{backgroundImage: `url(${legend.icons[i]})`, backgroundSize: 'contain', width:20, height:20, display:'inline-block' }} className='m-1'/>
                        <div className='flex-1 pl-2'>{d}</div>
                    </div>
                )
            }
        </div>
    )
}

const LegendCompSimple = ({layer}) => {
    const {legend} = layer
    return (
        <div className='bg-white p-2 rounded w-full my-1'>
            <h4 className='text-lg font-medium'>{layer.name} <span className='text-md font-medium'>{legend.units}</span></h4>
            {
                legend.domain.map((d,i) =>
                    <div key={i} className=' flex align-baseline'>
                        <div style={{backgroundColor: legend.range[i], width:20, height:20, display:'inline-block' }} className='m-1 rounded-full'/>
                        <div className='flex-1 pl-2'>{d}</div>
                    </div>
                )
            }
        </div>
    )
}

export default LegendContainer