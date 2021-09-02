import get from 'lodash.get'
import { getColorRange } from "../../utils"
const filters = {
  geography: {
    name: 'Geography',
    type: 'select',
    domain: [],
    value: [],
    searchable: true,
    accessor: d => d.name,
    valueAccessor: d => d.value,
    multi: true,
  },
  year: {
    name: 'Year',
    type: "select",
    multi: false,
    domain: [2016, 2017, 2018, 2019,2020, 2021],
    value: 2019
  },
  month: {
    name: 'Month',
    type: "select",
    multi: false,
    domain: [1,2,3,4,5,6,7,8,9,10,11,12],
    value: 1
  },
  hour: {
    name: "Hour",
    type: "select",
    multi: false,
    domain: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    value: 15
  }
 
 
}


const updateLegend = (filters, legend) => {
  
  //legend.type = "threshold";
  legend.range = getColorRange(get(legend, 'range.length', 6), "RdYlBu", true).reverse()
  legend.format = ",.2~f";
  
}


const getNetwork = (filters) => {
  if(filters.network.value == 'con') {
    return filters.conflation.value
  }
  return filters.network.value
}



const setActiveLayer = (layers, filters, mapboxMap) => {
  // console.log('setLayers ', filters.network.value, filters.year.value)
  return layers
    .map(l => l.id)
    .filter(l => l !== 'traffic_signals_layer')
    .map(l => {
      let output = null
      let type = l.split('-')[0]
      let year = l.split('-')[1]
      let checkYear = filters.year.value
      if(type === 'tmc' && +year === +checkYear) {
        output = l
        mapboxMap.setLayoutProperty(
          l,'visibility','visible'
        )
      } else if(type !== 'geo'){
        mapboxMap.setLayoutProperty(
          l,'visibility','none'
        )
      }
      return output
    }).filter(d => d)
   
}

// export filters
// export updateSubMeasures
// export getMeasure
// export getMeasureName
export {
  filters,
  updateLegend,
  setActiveLayer
}