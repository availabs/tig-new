import {LayerContainer} from "components/avl-map/src"
import {HOST} from "./layerHost";
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

class SED2040TazLevelForecastLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId
    }
    setActive = !!this.viewId
    name = '2040 SED TAZ Level Forecast'
    filters = {
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                {value: '37', name: '2010-2040 Earnings (Held constant in $ 2010)'},
                {value: '34', name: '2010-2040 Employed Labor Force'},
                {value: '30', name: '2010-2040 Group Quarters Homeless Population'},
                {value: '29', name: '2010-2040 Group Quarters Institutional Population'},
                {value: '31', name: '2010-2040 Group Quarters Other Population'},
                {value: '28', name: '2010-2040 Group Quarters Population'},
                {value: '26', name: '2010-2040 Household Income (Held constant in $ 2010)'},
                {value: '27', name: '2010-2040 Household Population '},
                {value: '32', name: '2010-2040 Households'},
                {value: '33', name: '2010-2040 Household Size'},
                {value: '36',name: '2010-2040 Office Employment'},
                {value: '35',name: '2010-2040 Retail Employment'},
                {value: '13',name: '2010-2040 School Enrollment'},
                {value: '25',name: '2010-2040 Total Employment'},
                {value: '24',name: '2010-2040 Total Population'},
                {value: '38',name: '2010-2040 University Enrollment'}
            ],
            value: this.viewId || '37',
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
        layers: ["nymtc_taz_2005"],
        callback: (layerId, features, lngLat) => {

            const area_id = features.reduce((a,c) => {
                a = get(c,['properties','name'],'')
                return a
            },'')

            return this.data.data.reduce((a,c) =>{
                if(c.area === area_id){

                    a.push(
                        [this.filters.dataset.domain.reduce((a,c) => {
                            if(c.value === this.filters.dataset.value){
                                a = c.name
                            }
                            return a
                        },'')],
                        ["Year:", this.filters.year.value],
                        ["Taz id:",c.area],["Value:",c[this.filters.year.value]]
                    )
                }

                return a
            },[])
        }
    }
    sources = [
        {
            id: "nymtc_taz_2005-93y4h2",
            source: {
                type: "vector",
                url: "mapbox://am3081.dgujwhsd"
            }
        }
    ]
    layers = [
        {
            id: "nymtc_taz_2005",
            filter: false,
            "source-layer": "nymtc_taz_2005",
            source: "nymtc_taz_2005-93y4h2",
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
        domain: [],
        range: getColorRange(5, "YlOrRd", true),
        show: true,
        Title: "",
        format: ",d",

    }


    init(map){

        return fetcher(`${HOST}views/${this.filters.dataset.value}/data_overlay`)
            .then(response => {
                this.data = response
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if (c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}-${this.filters.year.value}`
                this.taz_ids = this.data.data.map(d => d.area).filter(d => d)
            })
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
                // do nothing
            }
        }

    }

    fetchData() {

        return new Promise(resolve =>
            fetcher(`${HOST}views/${this.filters.dataset.value}/data_overlay`)
                .then(response =>{
                    this.data = response
                    setTimeout(resolve,1000)
                },)
        );
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
                // do nothing
            }
        }
    }

    render(map) {

        if (this.taz_ids.length) {
            map.setFilter("nymtc_taz_2005", ["in", ["get", "name"], ["literal", this.taz_ids]]);
        }
        else {
            map.setFilter("nymtc_taz_2005", false);
        }
        this.processedData = this.data.data.reduce((acc,curr) =>{
            acc.push({
                'id': curr['area'] || '',
                'value': curr[this.filters.year.value]
            })
            return acc
        },[])

        const colorScale = this.getColorScale(this.processedData),
            colors = this.processedData.reduce((a,c) =>{
                a[c.id] = colorScale(c.value)
                return a
            },{})


        map.setPaintProperty("nymtc_taz_2005", "fill-color", [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#090",
            ["get", ["get", "name"], ["literal", colors]]
        ])

    }
}

export const SED2040TazLevelForecastLayerFactory = (options = {}) => new SED2040TazLevelForecastLayer(options);
