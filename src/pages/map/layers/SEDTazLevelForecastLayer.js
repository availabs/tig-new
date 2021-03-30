import { LayerContainer } from "@availabs/avl-map"
import {HOST} from "./layerHost";
import counties from '../wrappers/counties.json'
import { getColorRange} from "@availabs/avl-components"
import get from "lodash.get"

import {
    scaleLinear,
    scaleQuantile,
    scaleQuantize,
    scaleThreshold,
    scaleOrdinal
} from "d3-scale"
import { extent } from "d3-array"
class SEDTazLevelForecastLayer extends LayerContainer {
    setActive = true
    name = '2040 SED TAZ Level Forecast'
    filters = {
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                {value: '37', name: '2010-2040 Earnings (Held constant in $2010) (current: 2000)'},
                {value: '34', name: '2010-2040 Employed Labor Force (current: 2000)'},
                {value: '30', name: '2010-2040 Group Quarters Homeless Population (current: 2000)'},
                {value: '29', name: '2010-2040 Group Quarters Institutional Population (current: 2000)'},
                {value: '31', name: '2010-2040 Group Quarters Other Population (current: 2000)'},
                {value: '28', name: '2010-2040 Group Quarters Population (current: 2000)'},
                {value: '26', name: '2010-2040 Household Income (Held constant in $2010) (current: 2000)'},
                {value: '27', name: '2010-2040 Household Population (current: 2000)'},
                {value: '32', name: '2010-2040 Households (current: 2000)'},
                {value: '33', name: '2010-2040 Household Size (current: 2000)'},
                {value: '36',name: '2010-2040 Office Employment (current: 2000)'},
                {value: '35',name: '2010-2040 Retail Employment (current: 2000)'},
                {value: '13',name: '2010-2040 School Enrollment (current: 2000)'},
                {value: '25',name: '2010-2040 Total Employment (current: 2000)'},
                {value: '24',name: '2010-2040 Total Population (current: 2000)'},
                {value: '38',name: '2010-2040 University Enrollment (current: 2000)'}
            ],
            value: '37',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
        },
        year: {
            name: 'Year',
            type: 'select',
            domain: [2010,2015,2020,2025,2030,2035,2040],
            value: 2010,
            multi: false
        }
    }
    onHover = {
        layers: ["Counties"],
        callback: (layerId, features, lngLat) => {
            // const geoid = features.reduce((a,c) => {
            //     a = get(c,['properties','geoid'],'')
            //     return a
            // },'')
            // const graph = counties.reduce((a,c) =>{
            //     if (c.geoid === geoid ){
            //         a = c
            //     }
            //     return a
            // },{})
            // return this.data.data.reduce((a,c) =>{
            //     if(c.area === graph['name']){
            //         a.push(['County',`${c.area}-${graph['state_code']}`],["Value:",c[this.filters.year.value]])
            //     }
            //     return a
            // },[])

        }
    }
    sources = [
        {
            id: "tl_2011_36_taz10",
            source: {
                type: "vector",
                url: "mapbox://am3081.8j64e2wa"
            }
        }
    ]
    layers = [
        {
            id: "Taz",
            filter: false,
            "source-layer": "tl_2011_36_taz10",
            source: "tl_2011_36_taz10",
            type: "fill",
            paint: {
                "fill-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#090",
                    "#900"
                ],
                "fill-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    5, 0.5,
                    20, 0.1
                ]
            }
        }
    ]
    legend = {
        // types: ["quantile", "linear", "quantize", "ordinal"],
        // type: "linear",
        // domain: [0, 50, 100],
        // range: getColorRange(3, "BrBG", true),

        // type: "ordinal",
        // domain: ["One", "Two", "Three", "Four", "Five"],
        // range: getColorRange(5, "Set3", true),
        // height: 2,
        // width: 320,
        // direction: "horizontal",

        // type: "quantize",
        // domain: [0, 15000],
        // range: getColorRange(5, "BrBG", true),
        // format: ",d",

        type: "quantile",
        domain: [0,100,200,300,400,500],
        range: getColorRange(6, "YlOrRd", true),
        show: true,
        title: "2010-2040 Earnings (Held constant in $2010) (current: 2000)",

    }


    fetchData() {
        return fetch(`${HOST}views/${this.filters.dataset.value}/data_overlay`)
            .then(response => response.json())
            .then(response => {
                this.data = response
            })
    }

    getColorScale(data) {
        const { type, range, domain } = this.legend;
        switch (type) {
            case "quantile": {
                const domain = data.map(d => d.value).filter(d => d).sort();
                this.legend.domain = domain;
                return scaleQuantile()
                    .domain(domain)
                    .range(range);
            }
            case "quantize": {
                const domain = extent(data, d => d.value);
                this.legend.domain = domain;
                return scaleQuantize()
                    .domain(domain)
                    .range(range);
            }
            case "threshold": {
                return scaleThreshold()
                    .domain(domain)
                    .range(range)
            }
            case "linear":{
                return scaleLinear()
                    .domain(domain)
                    .range(range)
            }
            case "ordinal":{
                return scaleOrdinal()
                    .domain(domain)
                    .range(range)

            }
        }
    }

    render(map) {
        console.log('data',this.data)
        // const data_counties = this.data.data.map(item =>{
        //     return counties.reduce((a,c) =>{
        //         if(item.area === c.name){
        //             a['name'] = c.name
        //             a['geoid'] = c.geoid
        //         }
        //         return a
        //     },{})
        // })
        //
        // if (data_counties.length) {
        //     map.setFilter("Counties", ["in", ["get", "geoid"], ["literal", data_counties.map(d => d.geoid)]]);
        // }
        // else {
        //     map.setFilter("Counties", false);
        // }
        // this.legend.title = this.filters.dataset.domain.reduce((a,c) =>{
        //     if(c.value === this.filters.dataset.value){
        //         a = c.name + '-' + this.filters.year.value
        //     }
        //     return a
        // },'')
        // const processedData = this.data.data.reduce((acc,curr) =>{
        //     data_counties.forEach(data_county =>{
        //         if(curr.area === data_county.name){
        //             acc.push({
        //                 id: data_county.geoid,
        //                 value: curr[this.filters.year.value]
        //             })
        //         }
        //     })
        //     return acc
        // },[])
        //
        // const colorScale = this.getColorScale(processedData),
        //     colors = processedData.reduce((a,c) =>{
        //         if(c.value !== 0){
        //             a[c.id] = colorScale(c.value)
        //         }
        //         return a
        //     },{});
        //
        // map.setPaintProperty("Counties", "fill-color", [
        //     "case",
        //     ["boolean", ["feature-state", "hover"], false],
        //     "#090",
        //     ["get", ["get", "geoid"], ["literal", colors]]
        // ])


    }
}

export const SEDTazLevelForecastLayerFactory = (options = {}) => new SEDTazLevelForecastLayer(options);
