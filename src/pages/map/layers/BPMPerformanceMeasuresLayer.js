import {LayerContainer} from "components/avl-map/src"
import {HOST} from "./layerHost";
import {getColorRange} from "@availabs/avl-components"
import get from "lodash.get"
import _ from "lodash"
import * as d3scale from "d3-scale"
import counties from "../config/counties.json";
import {filters} from 'pages/map/layers/npmrds/filters.js'
import shpwrite from "../../../utils/shp-write";
import mapboxgl from "mapbox-gl";
import flatten from "lodash.flatten";

const color_scheme = {
    "start_color": "yellow",
    "end_color": "red",
    "class_count": 5
}

class BPMPerformanceMeasuresLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId

        this.vid = props.vid
        this.type = props.type
    }

    setActive = !!this.viewId
    name = 'BPM Performance Measures'
    filters = {
        geography: {...filters.geography},
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                // {value:'58',name:'2010 Base - Time period: All Day'},
                // {value:'62',name:'2040 Future - Time period: All Day'}
            ],
            value: this.viewId || '58',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
        },

        period: {
            name: 'Period',
            type: 'dropdown',
            domain: [
                {value: 0,name:'All Day'},
                {value: 1,name:'AM Peak'},
                {value: 2,name:'Mid Day'},
                {value: 3,name:'PM Peak'},
                {value: 4,name:'Night'},
            ],
            value: 0,
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
        },

        functional_class: {
            name: 'Functional class',
            type: 'dropdown',
            domain: [
                {value: 0,name:'Total'},
                {value: 1,name:'Highway'},
                {value: 2,name:'Arterial'},
                {value: 3,name:'Local'},
                {value: 4,name:'Ramps'},
                {value: 5,name:'Other'},
            ],
            value: 0,
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

        type: "quantile",
        range: getColorRange(5, "YlOrRd", true),
        domain: [],
        show: true,
        Title: "",
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
            return this.data
                .filter(d =>
                    Object.keys(this.filters)
                        .filter(f => !['dataset', 'geography', 'column'].includes(f))
                        .reduce((acc, curr) => {
                            return acc && (this.filters[curr].value === d[curr])
                        }, true)
                ).reduce((a,c) =>{
                if(c.name === graph['name']){
                    a = [ [`${this.filters.dataset.domain.reduce((a,c) => {
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
                        ['County:',`${c.name}-${graph['state_code']}`],
                        ["Value:",c[this.filters.column.value]] ]
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

    download(setLoading) {
        const filename = this.filters.dataset.domain.reduce((acc, d) => {
            if(d.value === this.filters.dataset.value){
                acc = d.name
                return acc
            }

            return acc
        }, 'download')

        let data = this.data
            .filter(d =>
                Object.keys(this.filters)
                    .filter(f => !['dataset', 'geography', 'column'].includes(f))
                    .reduce((acc, curr) => {
                        return acc && (this.filters[curr].value === d[curr])
                    }, true)
            )

        let d = data.reduce((acc,curr) =>{
            let data_tract = this.data_counties.filter(data_tract => curr.name === data_tract.name)[0]
            acc.push({
                geoid: data_tract.geoid,
                ...{...curr},
                geom: JSON.parse(curr.geom),
                area: curr.name,
                area_type: curr.type
            })
            return acc
        },[])

        let geoJSON = {
            type: 'FeatureCollection',
            features: []
        };

        _.uniqBy(d)
            .map(t => {
                return {
                    type: "feature",
                    properties: Object.keys(t).filter(t => t !== 'geom').reduce((acc, curr) => ({...acc, [curr]: t[curr]}) , {}),
                    geometry: t.geom
                }
            })
            .forEach((feat) => {
                let geom=feat.geometry;
                let props=feat.properties;

                if (geom.type === 'MultiPolygon'){
                    for (var i=0; i < geom.coordinates.length; i++){
                        var polygon = {
                            type: 'feature',
                            properties: props,
                            geometry:  {
                                'type':'Polygon',
                                'coordinates':geom.coordinates[i],
                            }
                        };
                        geoJSON.features.push(polygon)
                    }
                }else{
                    geoJSON.features.push(feat)
                }
            });

        return Promise.resolve(shpwrite.download(
            geoJSON,
            {
                file: filename,
                folder: filename,
                types: {
                    point: filename + ' point',
                    line: filename + ' line',
                    polyline: filename + ' polyline',
                    polygon: filename + ' polygon',
                    polygonm: filename + ' multiPolygon',
                }
            }
        )).then(setLoading(false))
    }

    getBounds() {
        let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value,
            filtered = this.geographies.filter(({value}) => geoids.includes(value));

        return filtered.reduce((a, c) => a.extend(c.bounding_box), new mapboxgl.LngLatBounds())
    }

    zoomToGeography() {
        if (!this.mapboxMap) return;

        const bounds = this.getBounds();

        if (bounds.isEmpty()) return;

        const options = {
            padding: {
                top: 25,
                right: 200,
                bottom: 25,
                left: 200
            },
            bearing: 0,
            pitch: 0,
            duration: 2000
        }

        options.offset = [
            (options.padding.left - options.padding.right) * 0.5,
            (options.padding.top - options.padding.bottom) * 0.5
        ];

        const tr = this.mapboxMap.transform,
            nw = tr.project(bounds.getNorthWest()),
            se = tr.project(bounds.getSouthEast()),
            size = se.sub(nw);

        const scaleX = (tr.width - (options.padding.left + options.padding.right)) / size.x,
            scaleY = (tr.height - (options.padding.top + options.padding.bottom)) / size.y;

        options.center = tr.unproject(nw.add(se).div(2));
        options.zoom = Math.min(tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)), tr.maxZoom);

        this.mapboxMap.easeTo(options);
    }

    saveToLocalStorage(geographies = this.filters.geography.value) {
        if (window.localStorage) {
            if (geographies.length) {
                window.localStorage.setItem("macro-view-geographies", JSON.stringify(geographies));
            } else {
                window.localStorage.removeItem("macro-view-geographies")
            }
        }
    }

    updateLegendDomain() {
        const domains = {
            58: {
                'vehicle_miles_traveled': [2900, 6375, 9069, 13740, 20958, 38322],
                'vehicle_hours_traveled': [74, 223, 313, 503, 789],
                'avg_speed': [16.11, 24.27, 29.9, 32.83, 34.83, 38.26]
            },
            62: {
                'vehicle_miles_traveled': [3801, 7548, 10517, 16107, 24273, 44357],
                'vehicle_hours_traveled': [101, 324, 398, 646, 856, 1594],
                'avg_speed': [15.31, 22.24, 28.49, 31.74, 34.66, 37.45]
            }
        }
        this.legend.domain = domains[this.filters.dataset.value][this.filters.column.value] || domains["58"]['vehicle_miles_traveled']
    }

    getColorScale(data) {
        return d3scale.scaleThreshold()
            .domain(this.legend.domain)
            .range(this.legend.range);
    }

    init(map, falcor){

        let states = ["36", "34", "09", "42"]

        falcor.get(['tig', 'views', 'byLayer', this.type], ["geo", states, "geoLevels"])
            .then(res => {

                let views = get(res, ['json', 'tig', 'views', 'byLayer', 'bpm_performance'], [])
                this.source = get(views, [0, 'source_name'], '')
                this.filters.dataset.domain = views.map(v => ({value: v.id, name: v.name}))

                this.filters.dataset.value = views.find(v => v.id === parseInt(this.vid)) ? parseInt(this.vid) : views[0].id

                this.updateLegendDomain()
                
                let geo = get(res, 'json.geo', {})
                const geographies = flatten(states.map(s => geo[s].geoLevels));

                this.geographies =
                    geographies.map(geo => ({
                        name: `${geo.geoname.toUpperCase()} ${geo.geolevel}`,
                        geolevel: geo.geolevel,
                        value: geo.geoid,
                        bounding_box: geo.bounding_box
                    }));
                this.zoomToGeography();
            })
    }

    fetchData(falcor) {

        let view = this.vid || 23

        return falcor.get(["tig", this.type, "byId", view, 'data_overlay'])
            .then(response => {

                this.data = get(response, ['json', "tig", this.type, "byId", view, 'data_overlay'], []);
                this.data_counties = this.data.map(item =>{
                    return counties.reduce((a,c) =>{
                        if(item.name === c.name){
                            a['name'] = c.name
                            a['geoid'] = c.geoid
                        }
                        return a
                    },{})
                })
                this.updateLegendTitle()

            })
    }

    updateLegendTitle(value){
        this.legend.Title = `${this.source},
        ${this.filters.dataset.domain.reduce((acc, curr) => {
            if(curr.value === this.filters.dataset.value){
                acc = curr.name
            }
            return acc
        }, '')}-${this.filters.column.domain.reduce((a,c) => {
            if(c.value === this.filters.column.value){
                a = c.name
            }
            return a
        },'')}, 
        Period: ${this.filters.period.domain.reduce((a,c) => {
            if(c.value === this.filters.period.value){
                a = c.name
            }
            return a
        },'')},
        Functional Class: ${this.filters.functional_class.domain.reduce((a,c) => {
            if(c.value === this.filters.functional_class.value){
                a = c.name
            }
            return a
        },'')}
        `
        this.updateLegendDomain()
    }

    onFilterChange(filterName,value,preValue){
        this.updateLegendTitle(value)

        switch (filterName) {
            case "geography": {
                this.zoomToGeography(value);
                this.saveToLocalStorage();
                break;
            }
            default: {
                //do nothing
            }
        }

    }

    getFormat(column){
        return ',d' ? column === 'value' : ',f'
    }

    render(map) {

        if (this.data_counties.length) {
            map.setFilter("Counties", ["in", ["get", "geoid"], ["literal", this.data_counties.map(d => d.geoid)]]);
        }
        else {
            map.setFilter("Counties", false);
        }

        this.processedData = this.data
            .filter(d =>
                Object.keys(this.filters)
                    .filter(f => !['dataset', 'geography', 'column'].includes(f))
                    .reduce((acc, curr) => {
                        return acc && (this.filters[curr].value === d[curr])
                    }, true)
            )
            .reduce((acc,curr) =>{
            this.data_counties.forEach(data_county =>{
                if(curr.name === data_county.name){
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
