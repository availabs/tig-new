import {LayerContainer} from "@availabs/avl-map"
import {HOST} from "./layerHost";
import {getColorRange} from "@availabs/avl-components"
import get from "lodash.get"
import {scaleLinear, scaleOrdinal, scaleQuantile, scaleQuantize, scaleThreshold} from "d3-scale"
import {extent} from "d3-array"
import fetcher from "../wrappers/fetcher";
import counties from "../config/counties.json";

class BPMPerformanceMeasuresLayer extends LayerContainer {
    setActive = true
    name = 'BPM Performance Measures'
    filters = {
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                {value:'58',name:'2010 Base'},
                {value:'62',name:'2040 Future'}],
            value: '58',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
        },
        column:{
            name: 'Column',
            type: 'dropdown',
            domain: [
                {name: 'VMT (in Thousands)',value:'vehicle_miles_traveled'},
                {name: 'VHT (in Thousands)', value:'vehicle_hours_traveled'},
                {name: 'Avg Speed (Miles/Hr)',value:'avg_speed'},
            ],
            value: 'vehicle_miles_traveled',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
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
        format: ',d',

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
                        [`${this.filters.dataset.domain.reduce((a,c) => {
                            if(c.value === this.filters.dataset.value){
                                a = c.name
                            }
                            return a
                        },'')}-${this.filters.column.domain.reduce((a,c) => {
                           if(c.value === this.filters.column.value){
                               a = c.name
                           } 
                           return a 
                        },'')}`],
                        ['County:',`${c.area}-${graph['state_code']}`],
                        ["Value:",c[this.filters.column.value]])
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

        return fetcher(`${HOST}views/${this.filters.dataset.value}/data_overlay`)
            .then(response =>{
                this.data = response
                this.legend.title = '2010 Base-VMT (in Thousands)'
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
                    a.push(c[this.filters.column.value])
                    return a
                },[])
                return response
            })

    }

    fetchData() {
        return new Promise(resolve =>
            fetcher(`${HOST}views/${this.filters.dataset.value}/data_overlay`)
                .then(response =>{
                    this.data = response
                    setTimeout(resolve,1000)
                })
        );
    }


    onFilterChange(filterName,value,preValue){

        switch (filterName){
            case "dataset":{
                this.legend.title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if (c.value === value){
                        a = c.name
                    }
                    return a
                },'')}-${this.filters.column.domain.reduce((a,c) => {
                    if(c.value === this.filters.column.value){
                        a = c.name
                    }
                    return a
                },'')}`
                this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()
                break;
            }
            case "column": {
                this.legend.title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if (c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}-${this.filters.column.domain.reduce((a,c) => {
                    if(c.value === value){
                        a = c.name
                    }
                    return a
                },'')}`
                this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()
                if(value === 'avg_speed'){
                    this.legend.format = ',f'
                }else{
                    this.legend.format = ',d'
                }
                break;
            }
            default:{
                //do nothing
            }
        }

    }

    getFormat(column){
        return ',d' ? column === 'value' : ',f'
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
        //
        this.processedData = this.data.data.reduce((acc,curr) =>{
            this.data_counties.forEach(data_county =>{
                if(curr.area === data_county.name){
                    acc.push({
                        id: data_county.geoid,
                        value: curr[this.filters.column.value]
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

export const BPMPerformanceMeasuresLayerFactory = (options = {}) => new BPMPerformanceMeasuresLayer(options);
