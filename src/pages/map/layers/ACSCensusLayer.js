import {LayerContainer} from "components/avl-map/src"
import {HOST} from "./layerHost";
import tracts from '../config/tracts.json'
import {getColorRange} from "@availabs/avl-components"
import get from "lodash.get"
import {acsCensusCategoryMappings} from "../config/acsCensusCategoryMappings";
import {scaleLinear, scaleOrdinal, scaleQuantile, scaleQuantize, scaleThreshold} from "d3-scale"
import {extent} from "d3-array"
import fetcher from "../wrappers/fetcher";
import {useParams} from "react-router-dom";

class ACSCensusLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.categoryName = props.name
        this.viewid = props.viewId
        this.vid = props.vid
    }

    setActive = !!this.viewId
    name = 'ACS Census Layer'
    filters = {
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                'Absolute and Relative Minority Population data',
                'Absolute and Relative Population Below Poverty'
            ],
            value:this.categoryName,
            multi:false,
            accessor: d => d.name,
            valueAccessor: d => d.value,
        },
        year: {
            name: 'Year',
            type: 'dropdown',
            domain: [
                2013,2014,2015,2016,2017,2018
            ],
            value: 2013,
            multi: false
        },
        column:{
            name: 'Column',
            type: 'dropdown',
            domain: [
                {name: 'Minority Population',value:'value'},
                {name: 'Percentage Minority', value:'percent'}
            ],
            value: 'value',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
        }
    }
    legend = {
        type: "quantile",
        range: getColorRange(5, "YlOrRd", true),
        domain: [],
        show: true,
        Title: "",
        format: ',d',
    }

    onHover = {
        layers: ["tracts"],
        callback: (layerId, features, lngLat) => {
            const geoid = features.reduce((a,c) => {
                a = get(c,['properties','GEOID'],'')
                return a
            },'')
            const graph = tracts.reduce((a,c) =>{
                if (c.geoid === geoid ){
                    a = c
                }
                return a
            },{})
            return this.data.reduce((a,c) =>{
                if(c.area === graph['name']){
                    a.push(
                        [`${this.filters.dataset.value || this.categoryName}${this.filters.column.value === 'percent' ? 'in %': ''}`],
                        ["Year:", this.filters.year.value],
                        ['Tract:',`${c.area}-${graph['state_code']}`],
                        ["Value:",c[this.filters.column.value]])
                }
                return a
            },[]).sort()

        }
    }

    sources = [
        {
            id: "nymtc_census_tracts",
            source: {
                type: "vector",
                url: "mapbox://am3081.3galhyzy"
            }
        }
    ]
    layers = [
        {
            id: "tracts",
            filter: false,
            "source-layer": "census_tracts",
            source: "nymtc_census_tracts",
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
        this.map = map
        return falcor.get(['tig', 'views', 'byLayer', 'acs_census'])
            .then(res => {
                let views = get(res, ['json', 'tig', 'views', 'byLayer', 'acs_census'], [])
                this.filters.dataset.domain = views.map(v => ({value: v.id, name: v.name}))
                this.filters.dataset.value = views.find(v => v.id === parseInt(this.vid)) ? parseInt(this.vid) : views[0].id
            })
    }

    fetchData(falcor) {
        const categoryValue = this.filters.dataset.value
        
        if(categoryValue){
            return falcor.get(["tig", "acs_census", "byId", categoryValue, 'data_overlay'])
                .then(response =>{
                    this.data = get(response, ['json', "tig", "acs_census", "byId", categoryValue, 'data_overlay'], [])
                    this.legend.Title = `${this.filters.dataset.value || this.categoryName}-${this.filters.year.value}`
                    this.data_tracts = this.data.map(item =>{
                        return tracts.reduce((a,c) =>{
                            if(item.area === c.name){
                                a['name'] = c.name
                                a['geoid'] = c.geoid
                            }
                            return a
                        },{})
                    })
                    this.legend.domain = this.data.reduce((a,c) =>{
                        a.push(c.value)
                        return a
                    },[])
                    return response
                    // return response
                })
        }


    }


    onFilterChange(filterName,value,preValue){
        if(!this.processedData) {
            return
        }
        switch (filterName){
            case "year" : {
                this.legend.Title = `${this.filters.dataset.value}-${value}`
                this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()
                break;
            }
            case "dataset":{
                this.legend.Title = `${value}-${this.filters.year.value}`
                this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()
                break;
            }
            case "column": {

                this.legend.Title = `${this.filters.dataset.value} in %-${this.filters.year.value}`
                this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()
                if(value === 'percent'){
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

    render(map, falcor) {
        if(!this.data || !map) {
            return this.fetchData(falcor)
        }
        if (this.data_tracts.length) {
            map.setFilter("tracts", ["in", ["get", "GEOID"], ["literal", this.data_tracts.map(d => d.geoid)]]);
        }
        else {
            map.setFilter("tracts", false);
        }
    //
        this.processedData = this.data.reduce((acc,curr) =>{
            this.data_tracts.forEach(data_tract =>{
                if(curr.area === data_tract.name){
                    acc.push({
                        id: data_tract.geoid,
                        value: curr[this.filters.column.value]
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
            ["get", ["get", "GEOID"], ["literal", colors]]
        ])
    }

}

export const ACSCensusLayerFactory = (options = {}) => new ACSCensusLayer(options);
