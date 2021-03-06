import {LayerContainer} from "components/avl-map/src"
import {HOST} from "./layerHost";
import fetcher from "../wrappers/fetcher";
import rtp_ids from '../config/rtp_ids.json'
import rtp_sponsors from '../config/rtp_sponsors.json'
var parse = require('wellknown');


class RTPProjectDataLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId
    }

    setActive = !!this.viewId
    name = 'RTP Project Data'
    filters = {
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                {name: '2040 RTP Projects', value: '53'},
                {name: '2045 RTP Projects', value: '141'}
            ],
            value: this.viewId || '53',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi: false
        },
        rtp_id: {
            name: 'RTP ID',
            type: 'dropdown',
            domain: rtp_ids.filter(d => d.name !== null),
            value: "Select All",
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi: false
        },
        year: {
            name: 'Year',
            type: 'dropdown',
            domain: ['Select All',2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2040],
            value: 'Select All'
        },
        project_type: {
            name: 'Project Type',
            type: 'dropdown',
            domain: [
                {name:'Select All',value:"Select All"},
                {name: 'Study', value: '1'},
                {name: 'Highway', value: '2'},
                {name: 'Ferry', value: '3'},
                {name: 'Transit', value: '4'},
                {name: 'Rail', value: '5'},
                {name: 'Truck', value: '6'},
                {name: 'Pedestrian', value: '7'},
                {name: 'Bike', value: '8'},
                {name: 'Bus', value: '10'},
                {name: 'ITS', value: '9'},
                {name: 'Parking', value: '12'}
            ],
            value: 'Select All',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi: false
        },
        plan_portion: {
            name: 'Plan Portion',
            type: 'dropdown',
            domain: [
                {name:'Select All',value:'Select All'},
                {name: 'Constrained', value: '2'},
                {name: 'Vision', value: '1'}
            ],
            value: 'Select All',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi: false
        },
        sponsor: {
            name: 'Sponsor',
            type: 'dropdown',
            domain: rtp_sponsors,
            value: 'Select All',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi: false
        }
    }
    legend = {
        type: "ordinal",
        domain: [],
        range: [],
        height: 5,
        width: 320,
        direction: "vertical",
        show:true,
        Title:""
    }
    sources = [
        {
            id: 'county_symbols',
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                }
            }
        },
        {
            id: 'county_lines',
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                }
            }
        },
        {
            id: 'county_polygons',
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                }
            }
        }
    ]
    onHover = {
        layers: ["county_lines", "county_polygons", 'poi-rail', 'poi-rail-metro', 'poi-us-interstate-truck-3', 'poi-bus', 'poi-bicycle-share', 'poi-ferry', 'poi-au-national-highway-3', 'poi-pitch-11', 'poi-college-11'],
        callback: (layerId, features, lngLat) => {
            const feature = features.reduce((a, c) => {
                a = this.data.data.reduce((acc, curr) => {

                    if (curr['rtp_id'] === c['properties']['rtp_id']
                        && curr['ptype'] === c['properties']['project_type']
                        && curr['plan_portion'] === c['properties']['plan_portion']
                        && curr['sponsor'] === c['properties']['sponsor']
                        && curr['description'] === c['properties']['description']
                    ) {
                        acc = curr
                    }
                    return acc
                },)
                return a
            }, {})

            return [
                ['Project ID:', feature['rtp_id']],
                ['Year:', this.filters.year.value],
                ['Plan Portion:', feature['plan_portion']],
                ['Sponsor:', feature['sponsor']],
                ['Project Type:', feature['ptype']],
                ['Cost:', feature['estimated_cost']],
                ['Description:', feature['description'].toLowerCase()]
            ]


        }
    }




    init(map) {

        const url = `${HOST}/views/${this.filters.dataset.value}/data_overlay`
        const cost_lower = ''
        const cost_upper = ''

        const params = `?utf8=%E2%9C%93&rtp_id=${this.filters.rtp_id.value === 'Select All'? '':this.filters.rtp_id.value}&current_year=${this.filters.year.value === 'Select All'? '':this.filters.year.value}&cost_lower=${cost_lower}&cost_upper=${cost_upper}&ptype=${this.filters.project_type.value === 'Select All'? '':this.filters.project_type.value}&plan_portion=${this.filters.plan_portion.value === 'Select All'? '':this.filters.plan_portion.value}&sponsor=${this.filters.sponsor.value === 'Select All'? '':this.filters.sponsor.value}&commit=Filter`
        return fetcher(url + params)
            .then(response => {
                this.data = response
                this.legend.domain = this.data.symbologies[0].color_scheme.map(d => d.value)
                this.legend.range = this.data.symbologies[0].color_scheme.map(d => d.color)
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}
               Year: ${this.filters.year.value === 'Select All' ? 'All':this.filters.year.value}, 
                RTP Id: ${this.filters.rtp_id.value === 'Select All'? 'All':this.filters.rtp_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                Plan Portion : ${this.filters.plan_portion.domain.reduce((a,c) =>{
                    if(c.value === this.filters.plan_portion.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Sponsor: ${this.filters.sponsor.domain.reduce((a,c) =>{
                    if(c.value === this.filters.sponsor.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')}
                `
            })
    }

    fetchData() {
        const url = `${HOST}/views/${this.filters.dataset.value}/data_overlay`
        const cost_lower = ''
        const cost_upper = ''
        const params = `?utf8=%E2%9C%93&rtp_id=${this.filters.rtp_id.value === 'Select All'? '':this.filters.rtp_id.value}&current_year=${this.filters.year.value === 'Select All'? '':this.filters.year.value}&cost_lower=${cost_lower}&cost_upper=${cost_upper}&ptype=${this.filters.project_type.value === 'Select All'? '':this.filters.project_type.value}&plan_portion=${this.filters.plan_portion.value === 'Select All'? '':this.filters.plan_portion.value}&sponsor=${this.filters.sponsor.value === 'Select All'? '':this.filters.sponsor.value}&commit=Filter`

        return fetcher(url + params)
            .then(response => {
                this.data = response
                this.legend.domain = this.data.symbologies[0].color_scheme.map(d => d.value)
                this.legend.range = this.data.symbologies[0].color_scheme.map(d => d.color)
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a 
                },'')}
                Year: ${this.filters.year.value === 'Select All' ? 'All':this.filters.year.value}, 
                RTP Id: ${this.filters.rtp_id.value === 'Select All'? 'All':this.filters.rtp_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name 
                    }
                    return a
                },'')},
                Plan Portion : ${this.filters.plan_portion.domain.reduce((a,c) =>{
                    if(c.value === this.filters.plan_portion.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Sponsor: ${this.filters.sponsor.domain.reduce((a,c) =>{
                    if(c.value === this.filters.sponsor.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')}
                `
            })
    }

    onFilterChange(filterName,value,preValue){

        switch (filterName){
            case "dataset" : {
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === value){
                        a = c.name
                    }
                    return a
                },'')}
                Year: ${this.filters.year.value === 'Select All' ? 'All':this.filters.year.value}, 
                RTP Id: ${this.filters.rtp_id.value === 'Select All'? 'All':this.filters.rtp_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                Plan Portion : ${this.filters.plan_portion.domain.reduce((a,c) =>{
                    if(c.value === this.filters.plan_portion.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Sponsor: ${this.filters.sponsor.domain.reduce((a,c) =>{
                    if(c.value === this.filters.sponsor.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')}
                `
                break;
            }
            case "year":{
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}
                Year: ${value === 'Select All'? 'All':value}, 
                RTP Id: ${this.filters.rtp_id.value === 'Select All'? 'All':this.filters.rtp_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                Plan Portion : ${this.filters.plan_portion.domain.reduce((a,c) =>{
                    if(c.value === this.filters.plan_portion.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Sponsor: ${this.filters.sponsor.domain.reduce((a,c) =>{
                    if(c.value === this.filters.sponsor.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')}
                `
                break;
            }
            case "rtp_id":{
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}
                Year: ${this.filters.year.value === 'Select All' ? 'All':this.filters.year.value}, 
                RTP Id: ${value === 'Select All'? 'All':value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                Plan Portion : ${this.filters.plan_portion.domain.reduce((a,c) =>{
                    if(c.value === this.filters.plan_portion.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Sponsor: ${this.filters.sponsor.domain.reduce((a,c) =>{
                    if(c.value === this.filters.sponsor.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')}
                `
                break;
            }
            case "project_type":{
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}
                Year: ${this.filters.year.value === 'Select All' ? 'All':this.filters.year.value}, 
                RTP Id: ${this.filters.rtp_id.value === 'Select All'? 'All':this.filters.rtp_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                Plan Portion : ${this.filters.plan_portion.domain.reduce((a,c) =>{
                    if(c.value === this.filters.plan_portion.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Sponsor: ${this.filters.sponsor.domain.reduce((a,c) =>{
                    if(c.value === this.filters.sponsor.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')}
                `
                break;
            }
            case "plan_portion":{
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}
                Year: ${this.filters.year.value === 'Select All' ? 'All':this.filters.year.value}, 
                RTP Id: ${this.filters.rtp_id.value === 'Select All'? 'All':this.filters.rtp_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                Plan Portion : ${this.filters.plan_portion.domain.reduce((a,c) =>{
                    if(c.value === value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Sponsor: ${this.filters.sponsor.domain.reduce((a,c) =>{
                    if(c.value === this.filters.sponsor.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')}
                `
                break;
            }
            case "sponsor": {
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}
                Year: ${this.filters.year.value === 'Select All' ? 'All':this.filters.year.value}, 
                RTP Id: ${this.filters.rtp_id.value === 'Select All'? 'All':this.filters.rtp_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                Plan Portion : ${this.filters.plan_portion.domain.reduce((a,c) =>{
                    if(c.value === this.filters.plan_portion.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Sponsor: ${this.filters.sponsor.domain.reduce((a,c) =>{
                    if(c.value === value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')}
                `
                break;
            }
            default:{
                //do nothing
            }
        }

    }

    onRemove(mapboxMap) {

        mapboxMap.removeLayer('poi-rail')
        mapboxMap.removeLayer('poi-rail-metro')
        mapboxMap.removeLayer('poi-us-interstate-truck-3')
        mapboxMap.removeLayer('poi-bus')
        mapboxMap.removeLayer('poi-bicycle-share')
        mapboxMap.removeLayer('poi-ferry')
        mapboxMap.removeLayer('poi-au-national-highway-3')
        mapboxMap.removeLayer('poi-pitch-11')
        mapboxMap.removeLayer('poi-college-11')
        mapboxMap.removeLayer('county_polygons')
        mapboxMap.removeLayer('county_lines')
        mapboxMap.removeSource('county_symbols')
        mapboxMap.removeSource('county_polygons')
        mapboxMap.removeSource('county_lines')
    }

    render(map) {

        let geojson = {
            type: "FeatureCollection",
            features: []
        }

        const symbols_map = {
            'Rail': 'rail',
            'Transit': 'rail-metro',
            'Truck': 'us-interstate-truck-3',
            'Bus': 'bus',
            'Bike': 'bicycle-share',
            'Ferry': 'ferry',
            'Highway': 'au-national-highway-3',
            'Pedestrian': 'pitch-11',
            'Study': 'college-11',

        }

        geojson.features = this.data.data.map((d, i) => {

            return {
                type: 'Feature',
                id: i,
                properties: {
                    "description": d['description'],
                    "estimated_cost": d['estimated_cost'],
                    "plan_portion": d['plan_portion'],
                    "project_type": d['ptype'],
                    "rtp_id": d['rtp_id'],
                    "sponsor": d['sponsor'],
                    "icon": symbols_map[d['ptype']]
                },
                geometry: parse(d['geography'])
            }
        })

        const symbols_geojson =
            {
                type: 'FeatureCollection',
                features: geojson.features.filter(d => {
                    if (d['geometry'] && d['geometry'].type === 'Point') {
                        return d
                    }
                    return false
                })
            }

        const polygon_geojson = {
            type: 'FeatureCollection',
            features: geojson.features.filter(d => {
                if (d['geometry'] && d['geometry'].type === 'MultiPolygon') {
                    return d
                }
                return false
            })
        }

        polygon_geojson.features.forEach(feature =>{

            feature.properties['color'] = this.data.symbologies[0].color_scheme.reduce((a,c) =>{
                if(c.label === feature.properties.project_type){
                    a = c.color
                }
                return a
            },'')
        })

        const line_geojson = {
            type: 'FeatureCollection',
            features: geojson.features.filter(d => {
                if (d['geometry'] && d['geometry'].type === 'MultiLineString') {
                    return d
                }
                return false
            })
        }


        line_geojson.features.forEach(feature =>{

            feature.properties['color'] = this.data.symbologies[0].color_scheme.reduce((a,c) =>{
                if(c.label === feature.properties.project_type){
                    a = c.color
                }
                return a
            },'')
        })

        if (map.getSource('county_lines')) {
            map.getSource('county_lines').setData(line_geojson)
        }

        if (!map.getLayer('county_lines')) {
            map.addLayer({
                id: "county_lines",
                source: 'county_lines',
                type: 'line',
                paint: {
                    'line-color': {
                        type:'identity',
                        property:'color'
                    },
                    'line-width': 3,

                }
            })
        }

        if (map.getSource('county_polygons')) {
            map.getSource('county_polygons').setData(polygon_geojson)
        }

        if (!map.getLayer('county_polygons')) {
            map.addLayer({
                id: 'county_polygons',
                source: 'county_polygons',
                type: 'fill',
                paint: {
                    "fill-color": {
                        type:'identity',
                        property:'color'
                    },
                    "fill-opacity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        5, 0.5,
                        20, 0.1
                    ]
                }
            })
        }
        if (map.getSource('county_symbols')) {
            map.getSource('county_symbols').setData(symbols_geojson)
        }
        geojson.features.forEach(feature => {
            if (feature.properties.icon) {
                let symbol = feature.properties.icon
                let layerID = 'poi-' + symbol;
                if (!map.getLayer(layerID)) {
                    map.addLayer({
                        'id': layerID,
                        'type': 'symbol',
                        'source': 'county_symbols',
                        'layout': {
                            'icon-image': symbol,
                            'icon-allow-overlap': true
                        },
                        'filter': ['==', 'icon', symbol]
                    })

                }

            }
        })

    }
}

export const RTPProjectDataLayerFactory = (options = {}) => new RTPProjectDataLayer(options)
