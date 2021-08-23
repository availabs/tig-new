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
  network: {
    name: "Network",
    type: "select",
    value: "tmc",
    multi: false,
    searchable: false,
    accessor: d => d.name,
    valueAccessor: d => d.value,
    domain: [
      { name: "TMC", value: "tmc" },
      { name: "Conflation", value: "con" },
      // { name: "RIS", value: "ris" }
    ]
  },
  conflation: {
    name: "Conflation",
    type: "select",
    value: "tmc",
    multi: false,
    searchable: false,
    accessor: d => d.name,
    valueAccessor: d => d.value,
    active: false,
    domain: [
      { name: "TMC", value: "tmc" },
      { name: "RIS", value: "ris" },
      { name: "OSM", value: "osm" }
    ]
  },

  year: {
    name: 'Year',
    type: "select",
    multi: false,
    domain: [2016, 2017, 2018, 2019,2020, 2021],
    value: 2019
  },
  compareYear: {
    name: 'Compare Year',
    type: 'select',
    multi: false,
    domain: ["none", 2016, 2017, 2018, 2019],
    value: "none",
    
  },
  measure: {
    name: 'Performance Measure',
    type: 'select',
    domain: [],
    value: 'lottr',
    searchable: true,
    multi: false,
    accessor: d => d.name,
    valueAccessor: d => d.value
  },
  freeflow: {
    name: "Use Freeflow",
    type: "select",
    accessor: d => d.name,
    valueAccessor: d => d.value,
    domain: [
      { name: "True", value: true },
      { name: "False", value: false }
    ],
    value: true,
    multi: false,
    searchable: false,
    active: false
  },
  risAADT: {
    name: "Use RIS AADT",
    type: "select",
    accessor: d => d.name,
    valueAccessor: d => d.value,
    domain: [
      { name: "True", value: true },
      { name: "False", value: false }
    ],
    value: true,
    multi: false,
    searchable: false,
    active: false
  },
  perMiles: {
    name: "Show Per Mile",
    type: "select",
    accessor: d => d.name,
    valueAccessor: d => d.value,
    domain: [
      { name: "True", value: true },
      { name: "False", value: false }
    ],
    value: false,
    multi: false,
    searchable: false,
    active: false
  },
  vehicleHours: {
    name: "Show Vehicle Hours",
    type: "select",
    accessor: d => d.name,
    valueAccessor: d => d.value,
    domain: [
      { name: "True", value: true },
      { name: "False", value: false }
    ],
    value: false,
    value: false,
    multi: false,
    searchable: false,
    active: false
  },
  percentiles: {
    name: "Percentile",
    type: "select",
    accessor: d => d.name,
    valueAccessor: d => d.value,
    multi: false,
    domain: [
      { name: "5th Percentile", value: "5pctl" },
      { name: "20th Percentile", value: "20pctl" },
      { name: "25th Percentile", value: "25pctl" },
      { name: "50th Percentile", value: "50pctl" },
      { name: "75th Percentile", value: "75pctl" },
      { name: "80th Percentile", value: "80pctl" },
      { name: "85th Percentile", value: "85pctl" },
      { name: "95th Percentile", value: "95pctl" }
    ],
    value: null,
    active: false
  },
  trafficType: {
    name: "Traffic Type",
    type: "select",
    accessor: d => d.name,
    valueAccessor: d => d.value,
    domain: [
      { name: "All Traffic", value: "" },
      { name: "All Trucks", value: "truck" },
      { name: "Single Unit Trucks", value: "singl" },
      { name: "Combination Trucks", value: "combi" },
    ],
    value: '',
    active: false
  },
  peakSelector: {
    name: "Peak Selector",
    type: "select",
    accessor: d => d.name,
    valueAccessor: d => d.value,
    domain: [],
    value: null,
    multi: false,
    active: false
  },
  attributes: {
    name: "Attributes",
    type: "select",
    accessor: d => d.name,
    valueAccessor: d => d.value,
    domain: [],
    value: null,
    multi: false,
    active: false
  }
}

const updateSubMeasures = (measure, filters, falcor, state) => {
  const {
    // fetchData,
    peakSelector,
    freeflow,
    risAADT,
    perMiles,
    vehicleHours,
    attributes,
    percentiles,
    trafficType
  } = filters;
  // console.log('mids',falcor.getCache(["pm3", "measureIds"]),get(falcor.getCache(["pm3", "measureIds"]), ["pm3", "measureIds","value"], []))
  const mIds = get(falcor.getCache(["pm3", "measureIds"]), ["pm3", "measureIds","value"], [])
  const mInfo = get(falcor.getCache(["pm3", "measureInfo"]), ["pm3", "measureInfo"], {});

  
  peakSelector.active = false;
  peakSelector.domain = [];
  trafficType.active = false;
  trafficType.value = ''

  freeflow.active = false;
  risAADT.active = false;
  perMiles.active = false;
  vehicleHours.active = false;
  percentiles.active = false;

  attributes.active = false;
  

  switch (measure) {
    case "emissions":
      peakSelector.active = true;
      peakSelector.domain = [
        { name: "No Peak", value: "none" },
        { name: "AM Peak", value: "am" },
        { name: "Off Peak", value: "off" },
        { name: "PM Peak", value: "pm" },
        { name: "Overnight", value: "overnight" },
        { name: "Weekend", value: "weekend" }
      ]
      risAADT.active = true;
      break;
    case "RIS":
      attributes.active = true;
      attributes.domain = mIds.filter(m => /^RIS_/.test(m))
        .map(id => ({
          name: get(mInfo, [id, "fullname"], id),
          value: id.replace("RIS_", "")
        }));
      break;
    case "TMC":
      attributes.active = true;
      attributes.domain =  mIds.filter(m => /^TMC_/.test(m))
        .map(id => ({
          name: get(mInfo, [id, "fullname"], id),
          value: id.replace("TMC_", "")
        }));
      break;
    case "lottr":
      peakSelector.active = true;
      peakSelector.domain = [
        { name: "No Peak", value: "none" },
        { name: "AM Peak", value: "am" },
        { name: "Off Peak", value: "off" },
        { name: "PM Peak", value: "pm" },
        { name: "Weekend", value: "weekend" }
      ]
      break;
    case "tttr":
      peakSelector.active = true;
      peakSelector.domain = [
        { name: "No Peak", value: "none" },
        { name: "AM Peak", value: "am" },
        { name: "Off Peak", value: "off" },
        { name: "PM Peak", value: "pm" },
        { name: "Overnight", value: "overnight" },
        { name: "Weekend", value: "weekend" }
      ]
      break;
    case "phed":
      peakSelector.active = true;
      peakSelector.domain = [
        { name: "No Peak", value: "none" },
        { name: "AM Peak", value: "am" },
        { name: "PM Peak", value: "pm" }
      ]
      freeflow.active = true;
      risAADT.active = true;
      perMiles.active = true;
      vehicleHours.active = true;
      trafficType.active = true;
      break;
    case "ted":
      freeflow.active = true;
      risAADT.active = true;
      perMiles.active = true;
      vehicleHours.active = true;
      trafficType.active = true;
      break;
    case "pti":
    case "tti":
      peakSelector.active = true;
      peakSelector.domain = [
        { name: "No Peak", value: "none" },
        { name: "AM Peak", value: "am" },
        { name: "PM Peak", value: "pm" }
      ]
      break;
    case "pct_bins_reporting":
      peakSelector.active = true;
      peakSelector.domain = [
        { name: "No Peak", value: "none" },
        { name: "AM Peak", value: "am" },
        { name: "Off Peak", value: "off" },
        { name: "PM Peak", value: "pm" },
        { name: "Overnight", value: "overnight" },
        { name: "Weekend", value: "weekend" }
      ]
      peakSelector.value = 'none';
    break;
    case "speed":
      peakSelector.active = true;
      peakSelector.domain = [
        { name: "No Peak", value: "total" },
        { name: "AM Peak", value: "am" },
        { name: "Off Peak", value: "off" },
        { name: "PM Peak", value: "pm" },
        { name: "Overnight", value: "overnight" },
        { name: "Weekend", value: "weekend" }
      ]
      percentiles.active = true;
      break;
    default:
      break;
  }

  if (!peakSelector.domain.reduce((a, c) => a || (c.value === peakSelector.value), false)) {
    peakSelector.value = measure === "speed" ? "total" : "none";
  }
  if ((measure !== "phed") && (measure !== "ted")) {
    freeflow.value = false;
    perMiles.value = false;
    vehicleHours.value = false;
  }
  if ((measure !== "phed") && (measure !== "ted") && (measure !== "emissions")) {
    risAADT.value = false;
  }

  percentiles.value = null;
  attributes.value = null;
}

const getMeasure = (filters) => {
  const {
    measure,
    peakSelector,
    freeflow,
    risAADT,
    perMiles,
    vehicleHours,
    attributes,
    percentiles,
    trafficType,
  } = filters;
  const out = [
    measure.value,
    trafficType.value,
    freeflow.value && "freeflow",
    risAADT.value && "ris",
    perMiles.value && "per_mi",
    vehicleHours.value && "vhrs",
    (measure.value === "speed") && percentiles.value,
    (peakSelector.value !== "none") && peakSelector.value,
    attributes.value
  ].filter(Boolean).join("_")

  // console.log('get measure', out);
  return out
}

const getMeasureName = (falcor, measure) => {
  let path = ["pm3", "measureInfo", measure, "fullname"]
  return get(falcor.getCache(path), path, "Measure");
}

const updateLegend = (filters, legend) => {
  if (filters.compareYear.value === "none") {
    switch (filters.measure.value) {
      case 'lottr':
        legend.range = getColorRange(get(legend, 'range.length', 6), "RdYlBu", true).reverse()
        legend.format = ",.2~f";
        break;
       case 'tttr':
        legend.range = getColorRange(get(legend, 'range.length', 6), "RdYlGn", true).reverse()
        legend.format = ",.2~f";
        break;
      case 'freeflow':
        legend.range = getColorRange(get(legend, 'range.length', 6), "RdPu", true)
        legend.format = ",.0~f";
        break;
      case 'pti':
        legend.range = getColorRange(get(legend, 'range.length', 6), "PRGn", true)
        legend.format = ",.2~f";
        break;
      case 'pti':
        legend.range = getColorRange(get(legend, 'range.length', 6), "PiYG", true)
        legend.format = ",.2~f";
        break;
      case 'phed':
        legend.range = getColorRange(get(legend, 'range.length', 6), "YlOrRd", true)
        legend.format = ",.2~s";
        break;
      case 'ted':
        legend.range = getColorRange(get(legend, 'range.length', 6), "YlOrBr", true)
        legend.format = ",.2~s";
      case 'emissions':
        legend.range = getColorRange(get(legend, 'range.length', 6), "Oranges", true)
        legend.format = ",.2~s";
        break;
      case 'speed':
        legend.range = getColorRange(get(legend, 'range.length', 6), "Spectral", true)
        legend.format = ",.0~f";
        break;
      case 'pct_bins_reporting':
        legend.range = getColorRange(get(legend, 'range.length', 6), "Greys", true)
        // legend.domain = [.1,.25,.5, .75, .9]
        legend.format = ",.2~f";
        break;
      default:
        legend.range = getColorRange(get(legend, 'range.length', 6), "Reds");
        legend.format = ",.2~s";
        break;
    }
  }
  else {
    //legend.type = "threshold";
    legend.domain = [-.30, -.20, -.10, 0, .10, .20, .30];
    legend.range = getColorRange(get(legend, 'range.length', 8), "RdYlGn").reverse();
    legend.format = ",.0%";
  }
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
      let checkYear = filters.network.value === 'con' ? 2019 : filters.year.value
      if(type === filters.network.value && +year === +checkYear) {
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
  updateSubMeasures,
  getMeasure,
  getMeasureName,
  updateLegend,
  getNetwork,
  setActiveLayer

}