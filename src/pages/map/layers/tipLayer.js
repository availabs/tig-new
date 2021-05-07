import {HOST} from './layerHost'
import { LayerContainer } from "@availabs/avl-map"
import tip_ids from '../config/tip_ids.json'
import tip_mpos from '../config/tip_mpos.json'
import fetcher from "../wrappers/fetcher";
var parse = require('wellknown');

class TestTipLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId

    }

    setActive = !!this.viewId
    name = 'TIP Mappable Projects'
    filters = {
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                {value:'131', name:'2014-2018 TIP Mappable Projects'},
                {value:'64', name:'2017-2021 TIP Mappable Projects'},
                {value:'187',name:'2020-2024 TIP Mappable Projects'}
            ],
            value: this.viewId || '131',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
        },
        tip_id :{
            name: 'Tip ID',
            type:'dropdown',
            domain: tip_ids,
            value: 'Select All',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
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
        mpo_name: {
            name: 'MPO Name',
            type:'dropdown',
            domain: tip_mpos,
            value: 'Select All',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
        },
        agency:{
            name:'Agency',
            type:'dropdown',
            domain:['Select All'],
            value:'Select All'
        },

    }
    legend = {
        type: "ordinal",
        domain: [],
        range: [],
        height: 5,
        width: 350,
        direction: "vertical",
        show:true,
        Title:""
    }
    onHover = {
        layers: ["tip_lines", "tip_symbols", 'tip-rail', 'tip-rail-metro', 'tip-bus', 'tip-bicycle-share', 'tip-ferry', 'tip-au-national-highway-3', 'tip-pitch-11', 'tip-college-11','tip-parking-11'],
        callback: (layerId, features, lngLat) => {

            const feature = features.reduce((a, c) => {
                a = this.data.data.reduce((acc, curr) => {
                    if (curr['tip_id'] === c['properties']['tip_id']
                        && curr['ptype'] === c['properties']['project_type']
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
                ['TIP ID:', feature['tip_id']],
                ['County:',feature['county']],
                ['MPO:',feature['mpo']],
                ['Sponsor:', feature['sponsor']],
                ['Project Type:', feature['ptype']],
                ['Cost:', feature['estimated_cost']],
                ['Description:', feature['description'].toLowerCase()]
            ]


        }
    }
    sources = [
        {
            id: 'tip_symbols',
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                }
            }
        },
        {
            id: 'tip_lines',
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                }
            }
        },
    ]

    init(map){
        const url = `${HOST}/views/${this.filters.dataset.value}/data_overlay`
        const cost_lower = ''
        const cost_upper = ''
        const params = `?utf8=%E2%9C%93&tip_id=${this.filters.tip_id.value === 'Select All'? '':this.filters.tip_id.value}&ptype=${this.filters.project_type.value === 'Select All'? '':this.filters.project_type.value}&mpo=${this.filters.mpo_name.value === 'Select All'? '':this.filters.mpo_name.value}&sponsor=${this.filters.agency.value === 'Select All'? '':this.filters.agency.value}&cost_lower=${cost_lower}&cost_upper=${cost_upper}&commit=Filter`
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
                TIP Id: ${this.filters.tip_id.value === 'Select All'? 'All':this.filters.tip_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                MPO Name: ${this.filters.mpo_name.domain.reduce((a,c) =>{
                    if(c.value === this.filters.mpo_name.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Agency: ${this.filters.agency.value === 'Select All'? 'All':''}
                `
            })
    }
    fetchData() {
        const url = `${HOST}/views/${this.filters.dataset.value}/data_overlay`
        const cost_lower = ''
        const cost_upper = ''
        const params = `?utf8=%E2%9C%93&tip_id=${this.filters.tip_id.value === 'Select All'? '':this.filters.tip_id.value}&ptype=${this.filters.project_type.value === 'Select All'? '':this.filters.project_type.value}&mpo=${this.filters.mpo_name.value === 'Select All'? '':this.filters.mpo_name.value}&sponsor=${this.filters.agency.value === 'Select All'? '':this.filters.agency.value}&cost_lower=${cost_lower}&cost_upper=${cost_upper}&commit=Filter`

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
                TIP Id: ${this.filters.tip_id.value === 'Select All'? 'All':this.filters.tip_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                MPO Name: ${this.filters.mpo_name.domain.reduce((a,c) =>{
                    if(c.value === this.filters.mpo_name.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Agency: ${this.filters.agency.value === 'Select All'? 'All':''}
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
                TIP Id: ${this.filters.tip_id.value === 'Select All'? 'All':this.filters.tip_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                MPO Name: ${this.filters.mpo_name.domain.reduce((a,c) =>{
                    if(c.value === this.filters.mpo_name.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Agency: ${this.filters.agency.value === 'Select All'? 'All':''}
                `
                break;
            }
            case "tip_id":{
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}
                TIP Id: ${value === 'Select All'? 'All':value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                MPO Name: ${this.filters.mpo_name.domain.reduce((a,c) =>{
                    if(c.value === this.filters.mpo_name.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Agency: ${this.filters.agency.value === 'Select All'? 'All':''}
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
                TIP Id: ${this.filters.tip_id.value === 'Select All'? 'All':this.filters.tip_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                MPO Name: ${this.filters.mpo_name.domain.reduce((a,c) =>{
                    if(c.value === this.filters.mpo_name.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Agency: ${this.filters.agency.value === 'Select All'? 'All':''}
                `
                break;
            }
            case "mpo_name":{
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}
                TIP Id: ${this.filters.tip_id.value === 'Select All'? 'All':this.filters.tip_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                MPO Name: ${this.filters.mpo_name.domain.reduce((a,c) =>{
                    if(c.value === value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Agency: ${this.filters.agency.value === 'Select All'? 'All':''}
                `
                break;
            }
            case "agency": {
                this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
                    if(c.value === this.filters.dataset.value){
                        a = c.name
                    }
                    return a
                },'')}
                TIP Id: ${this.filters.tip_id.value === 'Select All'? 'All':this.filters.tip_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
                    if(c.value === this.filters.project_type.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
                MPO Name: ${this.filters.mpo_name.domain.reduce((a,c) =>{
                    if(c.value === this.filters.mpo_name.value){
                        a = c.name === 'Select All' ? 'All': c.name
                    }
                    return a
                },'')},
               Agency: ${value === 'Select All'? 'All':''}
                `
                break;
            }
            default:{
                //do nothing
            }
        }

    }
    onRemove(mapboxMap) {

        mapboxMap.removeLayer('tip-rail')
        mapboxMap.removeLayer('tip-rail-metro')
        mapboxMap.removeLayer('tip-bus')
        mapboxMap.removeLayer('tip-bicycle-share')
        mapboxMap.removeLayer('tip-ferry')
        mapboxMap.removeLayer('tip-au-national-highway-3')
        mapboxMap.removeLayer('tip-pitch-11')
        mapboxMap.removeLayer('tip-college-11')
        mapboxMap.removeLayer('tip-parking-11')
        mapboxMap.removeLayer('tip_lines')
        mapboxMap.removeSource('tip_symbols')
        mapboxMap.removeSource('tip_lines')
    }
    render(map){
        let geojson = {
            type: "FeatureCollection",
            features: []
        }

        const symbols_map = {
            'Rail': 'rail',
            'Transit': 'rail-metro',
            'Bus': 'bus',
            'Bike': 'bicycle-share',
            'Ferry': 'ferry',
            'Highway': 'au-national-highway-3',
            'Pedestrian': 'pitch-11',
            'Study': 'college-11',
            'Parking':'parking-11'

        }
        let colors = this.data.symbologies[0].color_scheme.reduce( (out,curr) => {
            out[curr.value] = curr.color
            return out;
        }, {})

         geojson.features = this.data.data.map((d,i) => {
            return {
                "type": "Feature",
                id: i,
                "properties": {
                    county: d.county,
                    description: d.description,
                    estimated_cost : d.cost,
                    mpo: d.mpo,
                    project_type: d.ptype,
                    color: colors[d.ptype],
                    sponsor: d.sponsor,
                    tip_id: d.tip_id,
                    icon: symbols_map[d['ptype']]
                },
                "geometry": parse(d['geography'])
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

        const line_geojson = {
            type: 'FeatureCollection',
            features: geojson.features.filter(d => {
                if (d['geometry'] && d['geometry'].type === 'MultiLineString') {
                    return d
                }
                return false
            })
        }

        if (map.getSource('tip_symbols')) {
            map.getSource('tip_symbols').setData(symbols_geojson)
        }

        if(map.getSource('tip_lines')){
            map.getSource('tip_lines').setData(line_geojson)
        }

        if(!map.getLayer('tip_lines')){
            map.addLayer({
                'id': 'tip_lines',
                'type': 'line',
                source: 'tip_lines',
                paint: {
                    'line-width': 3,
                    'line-color': {
                        type:'identity',
                        property:'color'
                    },
                }
            })
        }


        geojson.features.forEach(feature => {
            if (feature.properties.icon) {
                let symbol = feature.properties.icon
                let layerID = 'tip-' + symbol;
                if (!map.getLayer(layerID)) {
                    map.addLayer({
                        'id': layerID,
                        'type': 'symbol',
                        'source': 'tip_symbols',
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


export const TestTipLayerFactory = (options = {}) => new TestTipLayer(options);

