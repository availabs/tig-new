import {LayerContainer} from "@availabs/avl-map"
import {HOST} from "./layerHost";
import get from "lodash.get"
import fetcher from "../wrappers/fetcher";
import hub_bound from '../config/hub_bound.json'
import mapboxgl from 'mapbox-gl';


class HubBoundTravelDataLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId
    }

    setActive = !!this.viewId
    name = 'Hub Bound Travel Data'
    filters = {
        year: {
            name: 'Year',
            type: 'dropdown',
            domain: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
            value: 2019,
            multi: false
        },
        from: {
            name: 'From',
            type: 'dropdown',
            domain: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'],
            value: '12AM',
            multi: false
        },
        to: {
            name: 'To',
            type: 'dropdown',
            domain: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'],
            value: '12PM',
            multi: false
        },
        mode: {
            name: 'Mode',
            type: 'dropdown',
            domain: [
                {name:'Bicycle',value:'9'},
                {name:'Express Bus',value:'5'},
                {name:'Local Bus',value:'4'},
                {name:'Private Ferry',value:'8'},
                {name:'Public Ferry',value:'7'},
                {name:'Rail Rapid Transit - Express',value:'3'},
                {name:'Rail Rapid Transit - Local',value:'2'},
                {name:'Suburban Rail',value:'1'},
                {name:'Tramway',value:'10'},
                {name:'Vehicles (Auto+Taxi+Trucks+Comm. Vans)',value:'6'}
            ],
            accessor: d => d.name,
            valueAccessor: d => d.value,
            value: '6',
            multi: false
        },
        direction: {
            name: 'Direction',
            type: 'dropdown',
            domain: ['Inbound', 'Outbound'],
            value: 'Inbound',
            multi: false
        }
    }
    onHover = {
        layers: ["county_points"],
        callback: (layerId, features, lngLat) => {
            const id = features.reduce((a,c)=>{
                a = get(c,['id'],'')
                return a
            },0)
            return this.data.data.reduce((a,c) =>{
                if(c.id === id){

                    a.push(
                        ['Facility Name:',c['loc_name']],
                        ['Sector:',c['sector_name']],
                        ['Mode:',c['mode_name']],
                        ['Route:',c['route_name']],
                        [c['var_name'],c['count']],

                    )
                }
                return a
            },[])



        }
    }
    legend = {
        type: "ordinal",
        domain: [],
        range: [],
        height: 5,
        width: 320,
        direction: "vertical",
        show:true
    }
    sources = [
        {
            id: "county_points",
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                },

            }
        }
    ]
    layers = [
        {
            id:"county_points",
            source:'county_points',
            type: 'circle',
            paint:{
                'circle-opacity':1
            },
            visibility: 'none',
        }
    ]

    init(map) {
        const from = this.convertTime(this.filters.from.value)
        const to = this.convertTime(this.filters.to.value)
        const url = `${HOST}/views/${this.viewId || '23'}/data_overlay?utf8=%E2%9C%93&`
        const params = `year=${this.filters.year.value}&hour=${from}&upper_hour=${to}&transit_mode=${this.filters.mode.value}&transit_direction=${this.filters.direction.value}&lower=&upper=&commit=Filter`

        return fetcher(url+params)
            .then(response => {
                this.data = response
                this.legend.domain = this.data.symbologies[0].color_scheme.map(d => d.value)
                this.legend.range = this.data.symbologies[0].color_scheme.map(d => d.color)
                this.legend.title = `Mode:${this.filters.mode.domain.reduce((a,c) => {
                    if(c.value === this.filters.mode.value){
                        a = c.name
                    }
                    return a
                },'')},
                Year:${this.filters.year.value},From:${this.filters.from.value} to ${this.filters.to.value}, 
                Direction: ${this.filters.direction.value}`

            })

    }

    fetchData() {

        const from = this.convertTime(this.filters.from.value)
        const to = this.convertTime(this.filters.to.value)
        const url = `${HOST}/views/23/data_overlay?utf8=%E2%9C%93&`
        const params = `year=${this.filters.year.value}&hour=${from}&upper_hour=${to}&transit_mode=${this.filters.mode.value}&transit_direction=${this.filters.direction.value}&lower=&upper=&commit=Filter`
        return fetcher(url+params)
            .then(response => {

                this.data = response
            })
    }

    onAdd(mapboxMap, falcor) {
        let coordinates = hub_bound.features[0].geometry.coordinates[0];
        let bounds =coordinates.reduce(function (bounds, coord) {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        mapboxMap.fitBounds(bounds,{
            padding: 10
        })
        return Promise.resolve();
    }

    onRemove(mapboxMap){

        mapboxMap.removeLayer('counties')
        mapboxMap.removeSource('counties')
        mapboxMap.fitBounds([
            [-70.12161387603946,45.142811053355814],
            [-78.23968012395866,39.90735688410206]
        ])
    }
    onFilterChange(filterName,value,preValue){

        switch (filterName){
            case "year" : {
                this.legend.title = `Mode:${this.filters.mode.domain.reduce((a,c) => {
                        if(c.value === this.filters.mode.value){
                            a = c.name 
                        }
                        return a 
                    },'')},
                Year:${value},From:${this.filters.from.value} to ${this.filters.to.value}, 
                Direction: ${this.filters.direction.value}`
                break;
            }
            case "from":{
                this.legend.title = `Mode:${this.filters.mode.domain.reduce((a,c) => {
                    if(c.value === this.filters.mode.value){
                        a = c.name
                    }
                    return a
                },'')},
                Year:${this.filters.year.value},From:${value} to ${this.filters.to.value}, 
                Direction: ${this.filters.direction.value}`
                break;
            }
            case "to":{
                this.legend.title = `Mode:${this.filters.mode.domain.reduce((a,c) => {
                    if(c.value === this.filters.mode.value){
                        a = c.name
                    }
                    return a
                },'')},
                Year:${this.filters.year.value},From:${this.filters.from.value} to ${value}, 
                Direction: ${this.filters.direction.value}`
                break;
            }
            case "mode":{
                this.legend.title = `Mode:${this.filters.mode.domain.reduce((a,c) => {
                    if(c.value === value){
                        a = c.name
                    }
                    return a
                },'')},
                Year:${this.filters.year.value},From:${this.filters.from.value} to ${this.filters.to.value}, 
                Direction: ${this.filters.direction.value}`
                break;
            }
            case "direction":{
                this.legend.title = `Mode:${this.filters.mode.domain.reduce((a,c) => {
                    if(c.value === this.filters.mode.value){
                        a = c.name
                    }
                    return a
                },'')},
                Year:${this.filters.year.value},From:${this.filters.from.value} to ${this.filters.to.value}, 
                Direction: ${value}`
                break;
            }
            default:{
                //do nothing
            }
        }

    }

    convertTime(time){
        let value = 0
        if (time.includes('AM') && time !== '12AM'){
            value = time.substring(0,time.length - 1)
        }
        else if(time.includes('PM') && time !== '12PM'){
            value = 12 + parseInt(time.substring(0,time.length - 1))
        }
        else if(time === '12AM'){
            value = 0
        }else{
            value = 12
        }
        return value
    }

    render(map){

        let geojson = {
            type: "FeatureCollection",
            features : []
        }

        let line_geojson = {
            type:'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry : {
                    type: 'LineString',
                    coordinates: hub_bound.features[0].geometry.coordinates[0]
                }
            }
        }

        const colors = {}

        this.data.data.forEach(d=>{
        this.data.symbologies[0].color_scheme.forEach(item =>{
            if (item.value === d['sector_name']){
                    colors[d['sector_name']] = item.color
                }
            })
        })

        geojson.features = this.data.data.map(item =>{

            return {
                type: "Feature",
                id:item['id'],
                properties: {
                    "name":item['loc_name'],
                    "sector":item['sector_name'],

                },
                geometry: {
                    type:"Point",
                    "coordinates": [item["lng"],item["lat"]]
                }
            }
        })


        if(!map.getSource('counties') && !map.getLayer('counties')){
            map.addSource('counties', line_geojson)
            map.addLayer({
                id: "counties",
                source:'counties',
                type: 'line',
                paint:{
                    'line-color': 'black',
                    'line-width':1,
                    'line-dasharray':[10,5]
                }
            })
        }
        if(map.getSource('county_points')){
            map.getSource('county_points').setData(geojson)
        }

        if(map.getSource('county_points') && map.getLayer("county_points")){
            map.setPaintProperty(
                'county_points',
                'circle-color',
                ["get", ["to-string", ["get", "sector"]], ["literal",colors]]
            )
        }
    }


}



export const HubBoundTravelDataLayerFactory = (options = {}) => new HubBoundTravelDataLayer(options);
