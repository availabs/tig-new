import React from "react"

import { format as d3format } from "d3"

import { useTheme } from "@availabs/avl-components"

import { BarGraph } from "avl-graph/src"

const indexFormat = i => `Year ${ i }`,
  valueFormat = d3format(",.1f");

const StationVMTGraph = ({ data }) => {
  const graphData = React.useMemo(() => {
    return data.map(({ year, data }) => {
      const length = data.reduce((a, c) => a + (c.length || 0), 0);

      const [cars, trucks] = data.reduce((a, c) => {
        const truck = (c.aadt_combo + c.aadt_single_unit),
          car = (c.aadt - truck),
          percent = (c.length / length);
        a[0] += (car * percent) * length;
        a[1] += (truck * percent) * length;
        return a;
      }, [0, 0]);
      return {
        index: year,
        cars,
        trucks
      }
    })
  }, [data]);
  const theme = useTheme();

  return (
    <div style={ { minHeight: "400px" } } className="w-full h-full">
      <BarGraph data={ graphData }
        margin={ { left: 100, bottom: 50 } }
        keys={ ["cars", "trucks"] }
        padding={ 0.5 }
        theme={ theme }
        hoverComp={ {
          indexFormat,
          valueFormat
        } }
        axisLeft={ {
          label: "VMT by Vehicle Type"
        } }
        axisBottom={ {
          label: "Years"
        } }/>
    </div>
  )
}
export default StationVMTGraph;
