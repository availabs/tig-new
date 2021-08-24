import React from 'react'
//import get from 'lodash.get'
// import {Link} from 'react-router-dom'
// import { useFalcor } from '@availabs/avl-components'

// const f_system_meta = {
//   "1": "Interstate",
//   "2": "Principal Arterial – Freeways and Expressways",
//   "3": "Principal Arterial – Other",
//   "4": "Minor Arterial",
//   "5": "Major Collector",
//   "6": "Minor Collector",
//   "7": "Local"
// }


const HoverComp = ({ data, layer }) => {
 

  // const network = layer.getNetwork(layer.filters)
  // const key = get(data.filter(d => d[0] === network),'[0][1]', false)
  // const hoverLayer = get(data.filter(d => d[0] === 'hoverlayer'),'[0][1]', 'tmc')

  //return <TmcComp data={data} layer={layer} tmc={key} />
  

  return <DefaultHoverComp data={data} layer={layer} />
}

// const TmcComp = ({ data, layer, tmc }) => {
//   const { falcor, falcorCache } = useFalcor();

//   React.useEffect(() => {
//     if (tmc === null) return;
//     // console.log('hover fetch')
//     return falcor.get(
//       ["tmc", tmc, 'meta', layer.filters.year.value, ["miles", "roadname", "aadt", "f_system", "nhs","frc"]],
//       ['conflation', 'tmc', tmc, 'data', layer.filters.year.value, ['pct_bins_reporting', 'pct_bins_reporting_am','pct_bins_reporting_pm','pct_bins_reporting_off']]
//     )
//   }, [falcor, tmc]);

//   const TmcInfo = React.useMemo(() => {
//     return  get(falcorCache, ["tmc", tmc, 'meta', layer.filters.year.value], {})
//   }, [tmc, falcorCache]);

//   const n = React.useMemo(() => {
//     return data.filter(d => d[0] === 'n')[0][1]
//   }, [data])

//   const MeasureInfo = React.useMemo(() => {
//     return  get(falcorCache, [
//         "conflation", 
//         'tmc', 
//         tmc, 
//         "data",
//         layer.filters.year.value
//       ], {})
//   }, [tmc, falcorCache]);

//   // console.log('MeasureInfo', MeasureInfo)

//   return (
//     <div className="p-1 w-44 overflow-hidden">
//       <div className=" px-2">
//         <div className="text-center text-lg">
//           { TmcInfo.roadname }
//         </div>
//         <div className='flex  '>
//           <div className='text-xs flex-1 font-bold'>TMC</div>
//           <div className='flex-0'><a target='_blank' href={`/tmc/${tmc}`}>{tmc}</a></div>
//         </div>
//         <div className='flex  '>
//           <div className='text-xs flex-1 font-bold'>Functional Class</div>
//           <div className='flex-0'>{(get(TmcInfo , 'f_system' , 0) || 0)} - {n}</div>
//         </div>
//         <div className='flex  '>
//           <div className='text-xs flex-1 font-bold'>FRC</div>
//           <div className='flex-0'>{(get(TmcInfo , 'frc' , 0) || 0)}</div>
//         </div>
//        {/* <div className='flex text-xs text-center'>
//           <div className='flex-1'>from</div>
//           <div className='flex-1'>to</div>
//         </div>
//         <div className='flex text-xs text-center'>
//           <div className='flex-1'>{RisInfo.begin_description}</div>
//           <div className='flex-1'>{RisInfo.end_description}</div>
//         </div>
//         <div className='flex text-xs text-center'>
//           <div className='flex-1'>{RisInfo.beg_mp}</div>
//           <div className='flex-1'>{RisInfo.end_mp}</div>
//         </div>*/}
       
//         {/*<div className='flex text-xs  p-1'>
//           <div className='flex-1 font-bold text-center'>Station {get(data , `[1][1]` , '')}</div>
//         </div>*/}
//         <div className='flex '>
//           <div className='text-xs flex-1 font-bold'>AADT</div>
//           <div className='flex-0'>{(get(TmcInfo , 'aadt' , 0) || 0).toLocaleString()}</div>
//         </div>
//         <div className='flex pb-1'>
//           <div className='text-xs flex-1 font-bold'>Length</div>
//           <div className='flex-0'>{get(TmcInfo , 'miles' , 0).toLocaleString()} mi</div>
//         </div>
//         <div className='flex '>
//           <div className='text-md flex-1 font-bold text-center'>Epochs Reporting (%)</div>
//         </div>
//         <div className='flex pb-1'>
//           <div className='text-md flex-1 text-center'>
//             <div className='text-xs font-bold'>Total</div>
//             <div>{(get(MeasureInfo,'pct_bins_reporting',0)*100).toFixed(0)}</div>
//           </div>
//           <div className='text-md flex-1 text-center'>
//             <div className='text-xs font-bold'>AM</div>
//             <div>{(get(MeasureInfo,'pct_bins_reporting_am',0)*100).toFixed(0)}</div>
//           </div>
//           <div className='text-md flex-1 text-center'>
//             <div className='text-xs font-bold'>OFF</div>
//             <div>{(get(MeasureInfo,'pct_bins_reporting_off',0)*100).toFixed(0)}</div>
//           </div>
//           <div className='text-md flex-1 text-center'>
//             <div className='text-xs font-bold'>PM</div>
//             <div>{(get(MeasureInfo,'pct_bins_reporting_pm',0)*100).toFixed(0)}</div>
//           </div>
          
//         </div>
//         <div className=''>
//           <div className='text-xs flex-1 font-bold text-center'>{layer.getMeasureName(layer.falcor,layer.getMeasure(layer.filters))}</div>
//           <div className='flex-0 text-lg text-center'>{(MeasureInfo[layer.getMeasure(layer.filters)] || 0).toLocaleString()}</div>
//         </div>
//         {/*<div className='flex text-xs pb-1'>
//           <div className='flex-1 font-bold'>AADT Comb</div>
//           <div className='flex-0'>{RisInfo.aadt_combo}</div>
//         </div>*/}
       
        
//       </div>
//     </div>
//   )
// }


const DefaultHoverComp = ({ data, layer }) => {
  //const theme = useTheme();
  return (
    <div className={ `rounded relative px-1` }>
      { data.map((row, i) =>
          <div key={ i } className="flex">
            { row.map((d, ii) =>
                <div key={ ii }
                  className={ `
                    ${ ii === 0 ? "flex-1 font-bold" : "flex-0" }
                    ${ row.length > 1 && ii === 0 ? "mr-4" : "" }
                    ${ row.length === 1 && ii === 0 ? `border-b-2 text-lg ${ i > 0 ? "mt-1" : "" }` : "" }
                  ` }>
                  { d }
                </div>
              )
            }
          </div>
        )
      }
    </div>
  )
}


export default HoverComp