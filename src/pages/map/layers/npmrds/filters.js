import get from 'lodash.get'
import { getColorRange } from "../../utils"
const filters = {
  geography: {
    name: 'Geography',
    type: 'select',
    domain: [
      { 
        name: 'All',
        value: ['36061', '36005', '36047', '36081', '36085','09001', '09005', '09009','36111', '36027', '36071', '36105', '36087', '36119', '36079','36059', '36103','34003', '34019', '34017', '34021', '34023', '34025', '34027', '34029', '34031', '34035', '34037', '34039', '36113', '34013']
      }, 
      {
        name: 'NYBPM Counties',
        value: ['36061', '36005', '36047', '36081', '36085','09001', '09005', '09009','36111', '36027', '36071', '36105', '36087', '36119', '36079','36059', '36103','34003', '34019', '34017', '34021', '34023', '34025', '34027', '34029', '34031', '34035', '34037', '34039', '36113', '34013']
      },
      {
        name: 'Connecticut',
        value:  ['09001', '09005', '09009']
      },
      {
        name: 'Long Island',
        value:  ['36059', '36103']
      },
      {
        name: 'Mid Hudson',
        value:  ['36111', '36027', '36071', '36105', '36087', '36119', '36079']
      },
      {
        name: 'Mid Hudson South',
        value:  ['36079', '36119', '36087']
      },
      {
        name: 'New Jersey',
        value: ['34003', '34019', '34017', '34021', '34023', '34025', '34027', '34029', '34031', '34035', '34037', '34039', '36113', '34013'] 
      },{
        name: 'New York City',
        value:  ['36061', '36005', '36047', '36081', '36085'],
        valueNames: ['queens', 'kings', 'new york', 'bronx', 'richmond']
      }
    ],
    value: "All",
    searchable: true,
    accessor: d => d.name,
    valueAccessor: d => d.name,
    multi: false,
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
  },
  dow: {
    name: "Day of Week",
    type: "select",
    multi: false,
    domain: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    value: 'Thursday'
  },
  vehicles: {
    name: "Vehicle Class",
    type: "select",
    multi: false,
    domain: ['All Vehicles', 'Freight Trucks Only', 'Passenger Vehicles Only'],
    value: 'All Vehicles'
  }
 
 
}


const updateLegend = (filters, legend) => {
  
  //legend.type = "threshold";
  //legend.range = getColorRange(get(legend, 'range.length', 6), "RdYlBu", true).reverse()
  //legend.format = ",.2~f";
  
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