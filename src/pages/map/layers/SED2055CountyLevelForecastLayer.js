import {LayerContainer} from "components/avl-map/src"
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
import fetcher from "../wrappers/fetcher";

class SED2055CountyLevelForecastLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId
    }
    setActive = !!this.viewId
    name = '2055 SED County Level Forecast'
    filters = {
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                // {value: '207', name: '2010-2055 Employed Labor Force'},
                // {value: '204', name: '2010-2055 Group Quarters Population'},
                // {value: '203', name: '2010-2055 Household Population'},
                // {value: '205', name: '2010-2055 Households'},
                // {value: '206', name: '2010-2055 Household Size'},
                // {value: '208', name: '2010-2055 Labor Force'},
                // {value: '201', name: '2010-2055 Payroll Employment'},
                // {value: '202', name: '2010-2055 Proprietors Employment'},
                // {value: '200', name: '2010-2055 Total Employment'},
                // {value: '199', name: '2010-2055 Total Population'}
            ],
            value: this.viewId || '207',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
        },
        year: {
            name: 'Year',
            type: 'dropdown',
            domain: [2010,2015,2017,2020,2025,2030,2035,2040,2045,2050,2055],
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
        Title: "",

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
                        },''),],
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
                url: "https://tigtest2.nymtc.org/tiles/data/nymtc_2020_taz"
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



    init(map, falcor){
        falcor.get(['tig', 'views', 'byLayer', 'sed_county_2055'])
            .then(res => {
                let views = get(res, ['json', 'tig', 'views', 'byLayer', 'sed_county_2055'], [])
                this.filters.dataset.domain = views.map(v => ({value: v.id, name: v.name}))
            })
        // return fetcher(`${HOST}views/${this.filters.dataset.value}/data_overlay`)
        //     .then(response => {
        //         this.data = response
        //         this.legend.Title =`${this.filters.dataset.domain.reduce((a,c) =>{
        //             if (c.value === this.filters.dataset.value){
        //                 a = c.name
        //             }
        //             return a
        //         },'')}-${this.filters.year.value}`
        //         this.data_counties = this.data.data.map(item =>{
        //             return counties.reduce((a,c) =>{
        //                 if(item.area === c.name){
        //                     a['name'] = c.name
        //                     a['geoid'] = c.geoid
        //                 }
        //                 return a
        //             },{})
        //         })
        //         this.legend.domain = this.data.data.reduce((a,c) =>{
        //             a.push(c[this.filters.year.value])
        //             return a
        //         },[])

        //     })
    }

    fetchData() {

        return new Promise(resolve =>
            fetcher(`${HOST}views/${this.filters.dataset.value}/data_overlay`)
                .then(response =>{
                    this.data = response
                    this.data_counties = this.data.data.map(item =>{
                        return counties.reduce((a,c) =>{
                            if(item.area === c.name){
                                a['name'] = c.name
                                a['geoid'] = c.geoid
                            }
                            return a
                        },{})
                    })
                    setTimeout(resolve,1000)
                },)
        );
    }


    onFilterChange(filterName,value,preValue){

        switch (filterName){
            case "year" : {
                this.legend.Title = this.filters.dataset.domain.reduce((a,c) =>{
                    if (c.value === this.filters.dataset.value){
                        a = `${c.name}-${value}`
                    }
                    return a
                },'')
                this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()
                break;
            }
            case "dataset":{
                this.legend.Title = this.filters.dataset.domain.reduce((a,c) =>{
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

export const SED2055CountyLevelForecastLayerFactory = (options = {}) => new SED2055CountyLevelForecastLayer(options);
