import { LayerContainer } from "@availabs/avl-map"
import {HOST} from "./layerHost";
import tracts from '../config/tracts.json'
import { getColorRange} from "@availabs/avl-components"
import get from "lodash.get"
import {acsCensusCategoryMappings} from "../config/acsCensusCategoryMappings";
import {
    scaleLinear,
    scaleQuantile,
    scaleQuantize,
    scaleThreshold,
    scaleOrdinal
} from "d3-scale"
import { extent } from "d3-array"

class ACSCensusLayer extends LayerContainer {
    setActive = true
    name = 'ACS Census Layer'
    filters = {
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                'Absolute and Relative Minority Population data',
                'Absolute and Relative Population Below Poverty'],
            value: 'Absolute and Relative Minority Population data',
            multi:false
        },
        year: {
            name: 'Year',
            type: 'dropdown',
            domain: [
                2013,2014,2015,2016,2017,2018
            ],
            value: 2013,
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
        format: ",d",

    }

    onHover = {
        layers: ["tracts"],
        callback: (layerId, features, lngLat) => {
            const geoid = features.reduce((a,c) => {
                a = get(c,['properties','geoid'],'')
                return a
            },'')
            const graph = tracts.reduce((a,c) =>{
                if (c.geoid === geoid ){
                    a = c
                }
                return a
            },{})
            return this.data.data.reduce((a,c) =>{
                if(c.area === graph['name']){
                    a.push(
                        [this.filters.dataset.value],
                        ["Year:", this.filters.year.value],
                        ['Tract:',`${c.area}-${graph['state_code']}`],
                        ["Value:",c.value])
                }
                return a
            },[]).sort()

        }
    }

    sources = [
        {
            id: "tracts",
            source: {
                type: "vector",
                url: "mapbox://am3081.2x2v9z60"
            }
        }
    ]
    layers = [
        {
            id: "tracts",
            filter: false,
            "source-layer": "tracts",
            source: "tracts",
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
        const categoryValue = acsCensusCategoryMappings.reduce((a,c ) =>{
            if(c.name === this.filters.dataset.value && c.year === this.filters.year.value){
                a = c.value
            }
            return a
        },'')
        return fetch(`${HOST}views/${categoryValue}/data_overlay`)
            .then(response => response.json())
            .then(response => {
                this.data = response
                this.legend.title = `${this.filters.dataset.value}-${this.filters.year.value}`
                this.data_tracts = this.data.data.map(item =>{
                    return tracts.reduce((a,c) =>{
                        if(item.area === c.name){
                            a['name'] = c.name
                            a['geoid'] = c.geoid
                        }
                        return a
                    },{})
                })
                this.legend.domain = this.data.data.reduce((a,c) =>{
                    a.push(c.value)
                    return a
                },[])
                return response
            })
    }

    fetchData() {
        const categoryValue = acsCensusCategoryMappings.reduce((a,c ) =>{
            if(c.name === this.filters.dataset.value && c.year === this.filters.year.value){
                a = c.value
            }
            return a
        },'')
        return new Promise(resolve =>
            fetch(`${HOST}views/${categoryValue}/data_overlay`)
                .then(response => response.json())
                .then(response =>{
                    this.data = response
                    setTimeout(resolve,1000)
                })
        );
    }


    onFilterChange(filterName,value,preValue){

        switch (filterName){
            case "year" : {
                this.legend.title = `${this.filters.dataset.value}-${value}`
                this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()
                break;
            }
            case "dataset":{
                this.legend.title = `${value}-${this.filters.year.value}`
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

        if (this.data_tracts.length) {
            map.setFilter("tracts", ["in", ["get", "geoid"], ["literal", this.data_tracts.map(d => d.geoid)]]);
        }
        else {
            map.setFilter("tracts", false);
        }
    //
        this.processedData = this.data.data.reduce((acc,curr) =>{
            this.data_tracts.forEach(data_tract =>{
                if(curr.area === data_tract.name){
                    acc.push({
                        id: data_tract.geoid,
                        value: curr.value
                    })
                }
            })
            return acc
        },[])

        const colorScale = this.getColorScale(this.processedData),
            colors = this.processedData.reduce((a,c) =>{
                a[c.id] = colorScale(c.value)
                return a
            },{});

        map.setPaintProperty("tracts", "fill-color", [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#090",
            ["get", ["get", "geoid"], ["literal", colors]]
        ])
    }

}

export const ACSCensusLayerFactory = (options = {}) => new ACSCensusLayer(options);
