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

const TmcComp = ({ data, layer, tmc }) => {
  const { falcor, falcorCache } = useFalcor();

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

  const MeasureInfo = React.useMemo(() => {
    return get(
      falcorCache,
      ["conflation", "tmc", tmc, "data", layer.filters.year.value],
      {}
    );
  }, [tmc, falcorCache]);

  const currentData = get(layer, 'state.currentData', []).reduce((out, seg) => {
    out[seg.id] = seg
    return out
  },{})

  //console.log('MeasureInfo', currentData[tmc][layer.getMeasure(layer.filters)])

  return (
    <div className="p-1 w-44 overflow-hidden">
      <div className=" px-2">
        <div className="text-center text-lg">{TmcInfo.roadname}</div>
        <div className="flex  ">
          <div className="text-xs flex-1 font-bold">TMC</div>
          <div className="flex-0">
            <a target="_blank" href={`/tmc/${tmc}`}>
              {tmc}
            </a>
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
        {/*<div className="">
          <div className="text-xs flex-1 font-bold text-center">
            {layer.getMeasureName(
              layer.falcor,
              layer.getMeasure(layer.filters)
            )}
          </div>
          <div className="flex-0 text-lg text-center">
            {(
              get(currentData,`${tmc}.${layer.getMeasure(layer.filters)}`,0)
            ).toLocaleString()}
          </div>
        </div>*/}
       
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