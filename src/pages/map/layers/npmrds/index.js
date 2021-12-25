 import React from 'react'
import get from 'lodash.get'

import { getColorRange, /*Legend*/ } from "../../utils"
import { /*Select,*/ useFalcor } from '@availabs/avl-components'
import mapboxgl from "mapbox-gl"
import * as d3scale from "d3-scale"
import flatten from 'lodash.flatten'
import { download as shpDownload } from 'utils/shp-write';
//import len from '@turf/length'
// import flatten from 'lodash.flatten'

import { ckmeans } from 'simple-statistics'

import { 
  NpmrdsSources, 
  NpmrdsLayers
} from '../../map-styles/npmrds'

import { 
  TrafficSignalsSources,
  TrafficSignalsLayers
} from '../../map-styles/traffic_signals'

import { 
  filters,
  updateLegend,
  setActiveLayer
} from './filters'

import HoverComp from './HoverComp'
import { LayerContainer } from "components/avl-map/src"

/* ---- To Do ----- 
X - Data Overview
X - stop lights
X - All Years Working
1 - Get RIS with new IDS
3 - Overview Graph through time
4- test measures by geography
   ---------------- */
console.log('what text', getColorRange(6, "RdYlBu") ,getColorRange(6, "RdYlBu").reverse())
const getMonths = {
  1 : 'January',
  2 : 'February',
  3 : 'March',
}

class NPMRDSLayer extends LayerContainer {
  name = "NPMRDS speeds"
  attribution = "TMC map data © HERE"
  sources = [
    ...NpmrdsSources,
    ...TrafficSignalsSources,
    { id: "geo-boundaries-source",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: []
          }
        }
    },
  ]
  layers = [
    // ...ConflationLayerCase,
    ...NpmrdsLayers,
    // ...TrafficSignalsLayers,
    { id: "geo-boundaries",
      type: "line",
      source: "geo-boundaries-source",
      paint: {
        "line-color": "#fff"
      }
    }
  ]

  infoBoxes = [
    {
      Component: ({layer}) => (
        <div className='w-full bg-npmrds-600 w-full text-npmrds-100'>
          
        </div>
      ),
      show: false
    },
    
  ]
  toolbar = []
  filters = filters
  updateLegend = updateLegend
  setActiveLayer = setActiveLayer
  legend = {
    type: "threshold",
    domain: [10,20,30,40,55],
    range: ['rgb(255,0,0)', 'rgb(255,100,0)','rgb(255,255,0)','rgb(0,100,255)','rgb(0,0,255)','rgb(0,255,255)','rgb(0,255,0)'],//['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'],//['#4575b4', '#91bfdb', '#e0f3f8', '#fee090', '#fc8d59', '#d73027'],
    format: ",.1f",
    direction: 'horizontal',
    show: true,
    Title: ({ layer }) => {
      if(!layer) return
      return (<div className='text-gray-800'>
        <div>NPMRDS - {this.filters.vehicles.value}</div>
        <div className='text-sm font-light'> {this.filters.month.value} / {this.filters.year.value} {this.filters.hour.value}:00 - {this.filters.hour.value+1}:00 {this.filters.dow.value}</div> 
      </div>)
    },
    units: "Average Speed (mph)"
  }
  onHover = {
    layers: [...NpmrdsLayers.map(d => d.id)],
    filterFunc: function(layer, features, point, latlng) {

        const key = 'tmc',
          value = get(features, [0, "properties", key], "none"),
          dir = get(features, [0, "properties", "dir"], "none");
        return ["in", key, value] //["all", ["in", key, value], ["in", "dir", dir]];
    },
    callback: (layerId, features, lngLat) => {
      let feature = features[0]
     
      const key =  'tmc',
      value = get(features, [0, "properties", key], "none")

      let data = [
        ...Object.keys(feature.properties).map(k=> [k, feature.properties[k]])        
      ]
      data.push(['hoverlayer', layerId])
      return data
    },
    HoverComp
    
  }
  // onClick = {
  //   layers: [...ConflationLayers.map(d => d.id)],
  //   callback: (features, lngLat) => {
  //     let feature = features[0]
  //     console.log('click', feature, features)
  //   } 
  // }


  state = {
    activeStation: null,
    zoom: 6.6,
    progress: 0,
    qaLevel: 0.3,
    allMeasures: [],
    risAttributes: [],
    tmcAttributes: [],
    currentData: [],
    activeLayers: []
  }

  
  loadFromLocalStorage() {
    return window.localStorage ?
      JSON.parse(window.localStorage.getItem("macro-view-geographies") || "[]")
      : [];
  }

  saveToLocalStorage(geographies = this.filters.geography.value) {
    if (window.localStorage) {
      if (geographies.length) {
        window.localStorage.setItem("macro-view-geographies", JSON.stringify(geographies));
      }
      else {
        window.localStorage.removeItem("macro-view-geographies")
      }
    }
  }



  zoomToGeography() {
    if (!this.mapboxMap) return;

    const bounds = this.getBounds();

    console.log('got bounds', bounds)

    if (bounds.isEmpty()) return;

    const options = {
      padding: {
        top: 25,
        right: 200,
        bottom: 25,
        left: 200
      },
      bearing: 0,
      pitch: 0,
      duration: 2000
    }

    options.offset = [
      (options.padding.left - options.padding.right) * 0.5,
      (options.padding.top - options.padding.bottom) * 0.5
    ];

    const tr = this.mapboxMap.transform,
      nw = tr.project(bounds.getNorthWest()),
      se = tr.project(bounds.getSouthEast()),
      size = se.sub(nw);

    const scaleX = (tr.width - (options.padding.left + options.padding.right)) / size.x,
      scaleY = (tr.height - (options.padding.top + options.padding.bottom)) / size.y;

    options.center = tr.unproject(nw.add(se).div(2));
    options.zoom = Math.min(tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)), tr.maxZoom);

    this.mapboxMap.easeTo(options);
  }

  getBounds() {
    let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value,
      filtered = this.geographies
        .filter(({ value }) => geoids.includes(value));
    
    return filtered
      .reduce((a, c) => a.extend(c.bounds), new mapboxgl.LngLatBounds())
  }

  setActiveStation = () => {

  }
  
  init(map, falcor) {

    let states = ["36","34","09","42"]
    return falcor
      .get(
        ["geo", states, "geoLevels"],
        
      )
      .then((res) => {
        // const mInfo = get(res, ["json", "pm3", "measureInfo"], {});
        // console.log('measureInfo', res)
        console.log('res?', res)
        let geo = get(res,'json.geo',{})
        const geographies = flatten(states.map(s => geo[s].geoLevels));

        this.geographies = 
         geographies.map(geo => ({
            name: `${geo.geoname.toUpperCase()} ${geo.geolevel}`,
            geolevel: geo.geolevel,
            value: geo.geoid,
            bounding_box: geo.bounding_box
        }));
        //this.filters.geography.value = this.loadFromLocalStorage();
        //console.log('where am i', this.filters.geography.value)
        this.zoomToGeography();
      })
  }

  onFilterChange(filterName, newValue, prevValue) {
    switch (filterName) {
     

      case "geography":
        //console.log('new geography', newValue)
        this.zoomToGeography(newValue);
        this.saveToLocalStorage();
        break;
      
      default:
        console.log("no case for filter", filterName);
        break;
    }
  }
  
  getColorScale(domain) {
    if(this.legend.range.length > domain.length) {
      this.legend.domain  = []
      return false
    }
    this.legend.domain = [0,10,20,30,40,50,55]
    //ckmeans(domain,this.legend.range.length).map(d => Math.min(...d))
    this.updateLegend(this.filters,this.legend)
    return d3scale.scaleThreshold()
      .domain(this.legend.domain)
      .range(this.legend.range);
  }

  fetchData(falcor) {
    // console.log('fetchData')
    let year = +this.filters.year.value,
      month = +this.filters.month.value,
      geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value,
      filtered = this.geographies
        .filter(({ value }) => geoids.includes(value));
    
   // console.log('request', ['tig','npmrds',`${month}|${year}`,filtered.map(d => `${d.geolevel}|${d.value}`), 'data'])

    let requests = filtered.reduce((a, c) => { 
      a.push(['tig','npmrds',`${month}|${year}`,`${c.geolevel}|${c.value}`, 'data'])
      a.push(["geo", c.geolevel.toLowerCase(), c.value, "geometry"]);
      return a;
    },[])

    return falcor.get(...requests)
      // .then((data) => {
      //   //console.log('fetchData gem requests',data)
      //   console.log('got data', data)
      //   return data
      // })
        
  }

  async download() {
    let year = +this.filters.year.value,
      month = +this.filters.month.value,
      geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value,
      hour = this.filters.hour.value,
      vehicles = this.filters.vehicles.value,
      filtered = this.geographies
        .filter(({ value }) => geoids.includes(value));
    
    let falcorCache = this.falcor.getCache()
    let data = filtered.map(d => get(falcorCache, ['tig','npmrds',`${month}|${year}`,`${d.geolevel}|${d.value}`, 'data','value'],[]))
      .reduce((out,d) => {
        return {...out, ...d}
      }, {})  
    let selection = Object.keys(data)
    let geometries = await this.falcor.chunk(["tmc",selection,"year", year,"geometries"])
    falcorCache = this.falcor.getCache()
    let geojson =  {
      type: "FeatureCollection",
      features: selection.map(id => ({
        type: "Feature",
        geometry: get(falcorCache, ["tmc", id,"year", year,"geometries", "value"], "FAILED"),
        properties: {tmc: id, roadname: data[id].roadname, length: data[id].length, ...data[id].s }
      }))
    }
    console.log('Download clicked',geojson)    

    console.log()
    return shpDownload(geojson,
          { file: `npmrds_${year}_${month}_${vehicles}`,
            folder: `npmrds_${year}_${month}_${vehicles}`,
            types: { 
              polyline: `npmrds_${year}_${month}_${vehicles}`,
              line: `npmrds_${year}_${month}_${vehicles}`,
            }
          },
          // aliasString,
          // tmcMetaString
        )
  }
  
  render(map) {
    // console.log('render', this)
    //console.log('testing', map.getStyle().layers)
    let year = +this.filters.year.value,
      month = +this.filters.month.value,
      geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value,
      hour = this.filters.hour.value,
      filtered = this.geographies
        .filter(({ value }) => geoids.includes(value));

    this.setActiveLayer(
      this.layers,
      this.filters,
      this.mapboxMap
    );

    const falcorCache = this.falcor.getCache()
    let data = filtered.map(d => get(falcorCache, ['tig','npmrds',`${month}|${year}`,`${d.geolevel}|${d.value}`, 'data','value'],[]))
      .reduce((out,d) => {
        return {...out, ...d}
      }, {})

    //console.log('data',data)
      
    let domain = Object.values(data).map(d => get(d, `s[${hour}]`, 0))
    const scale = this.getColorScale(domain.sort((a, b) => a - b));
    const colors = Object.keys(data).reduce((a, c) => {
      let val = scale(get(data[c], `s[${hour}]`, 0))
      a[c] = val ? val : 'hsla(185, 0%, 27%,0.8)'
      return a;
    }, {});

    console.log('colors',colors)
    
    map.setPaintProperty(`tmc-${year}`, "line-color", [
      "case",
      ["has", ["to-string", ["get", 'tmc']], ["literal", colors]],
      ["get", ["to-string", ["get", 'tmc']], ["literal", colors]],
      "hsla(185, 0%, 27%,0.0)",
    ]);
    
    const collection = {
      type: "FeatureCollection",
      features: filtered
        .map((f) => ({
          type: "Feature",
          properties: { geoid: f.value },
          geometry: get(
            falcorCache,
            ["geo", f.geolevel.toLowerCase(), f.value, "geometry", "value"],
            null
          ),
        }))
        .filter((f) => Boolean(f.geometry)),
    };
    map.getSource("geo-boundaries-source").setData(collection);

  }


  

}

export const NPMRDSLayerFactory = (options = {}) => new NPMRDSLayer(options);
