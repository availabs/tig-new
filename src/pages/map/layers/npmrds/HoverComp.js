import React from 'react'
import get from 'lodash.get'
// import {Link} from 'react-router-dom'
 import { useFalcor } from '@availabs/avl-components'

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

  return <TmcComp data={data} layer={layer} tmc={data[0][1]} />
  

  //return <DefaultHoverComp data={data} layer={layer} />
}

let SpeedGraph = ({speeds, scale, hour}) => {
  return (
    <div className='w-64 flex h-16 items-end'>
      {speeds.map((speed,i) =>
         <div 
          key={i}
          className={`flex-1 text-xs text-white  ${hour === i ? 'border border-gray-800' : '' }`}
          style={{
            height: `${((speed/65)*100).toFixed(1)}%`,
            background: scale(speed)
          }}/>
           
        
      )}
    </div>
    )
}

const TmcComp = ({ data, layer, tmc }) => {
  const { falcor, falcorCache } = useFalcor();
  
  let tmcData = get(layer, `tmcData[${tmc}]`, {})
  
  
  React.useEffect(() => {
    if (tmc === null) return;
    // console.log('hover fetch')
    return falcor.get(
      [
        "tmc",
        tmc,
        "meta",
        layer.filters.year.value,
        ["miles", "roadname", "aadt", "f_system", "nhs", "frc"],
      ]
    );
  }, [falcor, tmc]);

  const TmcInfo = React.useMemo(() => {
    return get(falcorCache, ["tmc", tmc, "meta", layer.filters.year.value], {});
  }, [tmc, falcorCache]);

  const n = React.useMemo(() => {
    return data.filter((d) => d[0] === "n")[0][1];
  }, [data]);

  const currentData = get(layer, 'state.currentData', []).reduce((out, seg) => {
    out[seg.id] = seg
    return out
  },{})

  // console.log('TMC Hover',tmc, currentData, tmcData, tmcData.s)

  return (
    <div className="p-1 overflow-hidden bg-white">
      <div className=" px-2">
        <div className="text-center text-lg">{TmcInfo.roadname}</div>
        <div className="flex  ">
          <div className="text-xs flex-1 font-bold">TMC</div>
          <div className="flex-0">
              {tmc}
          </div>
        </div>
        <div className="flex  ">
          <div className="text-xs flex-1 font-bold">Functional Class</div>
          <div className="flex-0">
           {n}
          </div>
        </div>
        
        <div className="flex ">
          <div className="text-xs flex-1 font-bold">AADT</div>
          <div className="flex-0">
            {(get(TmcInfo, "aadt", 0) || 0).toLocaleString()}
          </div>
        </div>
        <div className="flex pb-1">
          <div className="text-xs flex-1 font-bold">Length</div>
          <div className="flex-0">
            {get(TmcInfo, "miles", 0).toLocaleString()} mi
          </div>
       
      </div>
      <div className=''>
        <SpeedGraph 
          speeds={get(tmcData,'s',[])} 
          scale={layer.scale}
          hour={layer.filters.hour.value}
          />
      </div>
    </div>
    </div>
  );
};


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