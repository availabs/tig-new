import React from "react"

import { format as d3format } from "d3"

import { getColorRange } from "@availabs/avl-components"

import { BarGraph } from "avl-graph/src"

const colors1 = getColorRange(7, "Set3"),
  colors2 = getColorRange(7, "Set1")

const Colors = colors1.reduce((a, c, i) => {
  a.push(c, colors2[i]);
  return a;
}, []);

const Classes = [
  1, 2, 4, 6, 7, 8, 9,
  11, 12, 14, 16, 17, 18, 19
];

const indexFormat = i => `Year ${ i }`,
  keyFormat = k => `F-Class ${ k }`,
  valueFormat = d3format(",.1f");

const VMTBarGraph = ({ data }) => (
  <div style={ { minHeight: "300px" } }
    className={ `
      flex justify-center items-center
      bg-blueGray-800 rounded-lg w-full h-full
    ` }>
    <BarGraph
      data={ data } keys={ Classes }
      margin={ { left: 130, bottom: 50 } }
      colors={ Colors }
      padding={ 0.5 }
      hoverComp={ {
        indexFormat,
        keyFormat,
        valueFormat
      } }
      axisBottom={ {
        label: "Years"
      } }
      axisLeft={ {
        label: "VMT by Functional Class"
      } }/>
  </div>
)
export default VMTBarGraph;
