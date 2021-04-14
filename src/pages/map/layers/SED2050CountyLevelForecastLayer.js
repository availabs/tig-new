import { LayerContainer } from "@availabs/avl-map"
import {HOST} from "./layerHost";
import counties from '../config/counties.json'
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
class SED2050CountyLevelForecastLayer extends LayerContainer {
    setActive = false
    name = '2050 SED County Level Forecast'
    filters = {
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                {value: '113', name: '2010-2050 Employed Labor Force'},
                {value: '110', name: '2010-2050 Group Quarters Population'},
                {value: '109', name: '2010-2050 Household Population'},
                {value: '111', name: '2010-2050 Households'},
                {value: '112', name: '2010-2050 Household Size'},
                {value: '114', name: '2010-2050 Labor Force'},
                {value: '107', name: '2010-2050 Payroll Employment'},
                {value: '108', name: '2010-2050 Proprietors Employment'},
                {value: '106', name: '2010-2050 Total Employment'},
                {value: '105', name: '2010-2050 Total Population'}
            ],
            value: '113',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
        },
        year: {
            name: 'Year',
            type: 'dropdown',
            domain: [2010,2012,2015,2020,2025,2030,2035,2040,2045,2050],
            value: 2010,
            multi: false
        }
    }
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
        range: getColorRange(5, "YlOrRd", true),
        domain: [],
        show: true,
        title: "",

    }

    onHover = {
        layers: ["Counties"],
        callback: (layerId, features, lngLat) => {
            const geoid = features.reduce((a,c) => {
                a = get(c,['properties','geoid'],'')
                return a
            },'')
            const graph = counties.reduce((a,c) =>{
                if (c.geoid === geoid ){
                    a = c
                }
                return a
            },{})
            return this.data.data.reduce((a,c) =>{
                if(c.area === graph['name']){
                    a.push(
                        [this.filters.dataset.domain.reduce((a,c) => {
                            if(c.value === this.filters.dataset.value){
                                a = c.name
                            }
                            return a
                        },'')],
                        ["Year:", this.filters.year.value],
                        ['County:',`${c.area}-${graph['state_code']}`],
                        ["Value:",c[this.filters.year.value]])
                }
                return a
            },[]).sort()

        }
    }

    sources = [
        {
            id: "counties",
            source: {
                type: "vector",
                url: "mapbox://am3081.a8ndgl5n"
            }
        }
    ]
    layers = [
        {
            id: "Counties",
            filter: false,
            "source-layer": "counties",
            source: "counties",
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



    init(map){
        return fetch(`${HOST}views/${this.filters.dataset.value}/data_overlay`)
            .then(response => response.json())
            .then(response => {
                this.data = response
                this.legend.title = `2010-2050 Employed Labor Force-${this.filters.year.value}`
                this.data_counties = this.data.data.map(item =>{
                    return counties.reduce((a,c) =>{
                        if(item.area === c.name){
                            a['name'] = c.name
                            a['geoid'] = c.geoid
                        }
                        return a
                    },{})
                })
                this.legend.domain = this.data.data.reduce((a,c) =>{
                    a.push(c[this.filters.year.value])
                    return a
                },[])

            })
    }

    fetchData() {

        return new Promise(resolve =>
            fetch(`${HOST}views/${this.filters.dataset.value}/data_overlay`)
                .then(response => response.json())
                .then(response =>{
                    this.data = response
                    setTimeout(resolve,1000)
                },)
        );
    }


    onFilterChange(filterName,value,preValue){

        switch (filterName){
            case "year" : {
                this.legend.title = this.filters.dataset.domain.reduce((a,c) =>{
                    if (c.value === this.filters.dataset.value){
                        a = `${c.name}-${value}`
                    }
                    return a
                },'')
                this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()
                break;
            }
            case "dataset":{
                this.legend.title = this.filters.dataset.domain.reduce((a,c) =>{
                    if (c.value === value){
                        a = `${c.name}-${this.filters.year.value}`
                    }
                    return a
                },'')
                this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()
                break;
            }
            default:{
                //do nothing
            }
        }
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
            default:{
                //do nothing
            }
        }
    }

    render(map) {

        if (this.data_counties.length) {
            map.setFilter("Counties", ["in", ["get", "geoid"], ["literal", this.data_counties.map(d => d.geoid)]]);
        }
        else {
            map.setFilter("Counties", false);
        }

        this.processedData = this.data.data.reduce((acc,curr) =>{
            this.data_counties.forEach(data_county =>{
                if(curr.area === data_county.name){
                    acc.push({
                        id: data_county.geoid,
                        value: curr[this.filters.year.value]
                    })
                }
            })
            return acc
        },[])


        const colorScale = this.getColorScale(this.processedData),
            colors = this.processedData.reduce((a,c) =>{
                if(c.value !== 0){
                    a[c.id] = colorScale(c.value)
                }
                return a
            },{});

        map.setPaintProperty("Counties", "fill-color", [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#090",
            ["get", ["get", "geoid"], ["literal", colors]]
        ])
    }


}

export const SED2050CountyLevelForecastLayerFactory = (options = {}) => new SED2050CountyLevelForecastLayer(options);
