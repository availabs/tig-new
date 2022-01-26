import {LayerContainer} from "components/avl-map/src"
import counties from '../config/counties.json'
import { getColorRange} from "@availabs/avl-components"
import * as d3scale from "d3-scale"
import get from "lodash.get"
import _ from 'lodash'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import flatten from "lodash.flatten";
import mapboxgl from "mapbox-gl";
import shpwrite from "../../../utils/shp-write";

class SED2040CountyLevelForecastLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId
        this.vid = props.vid
        this.type = props.type

        this.name = `${props.type.split('_')[2]} SED County Level Forecast`
    }


    filters = {
        geography: {...filters.geography},
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
            ],
            value: undefined,
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi:false
        },
        year: {
            name: 'Year',
            type: 'dropdown',
            domain: [],
            value: undefined,
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
            return this.data.reduce((a,c) =>{
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
                        ["Value:",c.data[this.filters.year.value]]
                    )
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

    download(){
        const filename = this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name +
            (this.filters.geography.value === 'All' ? '' : ` ${this.filters.geography.value}`);

        let d = this.data.reduce((acc,curr) =>{
            this.data_counties.forEach(data_tract =>{
                if(curr.area === data_tract.name){
                    acc.push({
                        geoid: data_tract.geoid,
                        ...{...curr.data},
                        geom: JSON.parse(curr.geom),
                        area: curr.area,
                        area_type: curr.type
                    })
                }
            })
            return acc
        },[])

        let geoJSON = {
            type: 'FeatureCollection',
            features: []
        };

        d
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
        console.log('counts', _.uniq(geoJSON.features.map(f => f.geometry.type)), geoJSON.features.filter(f => f.geometry.type === 'Polygon').length, geoJSON.features.filter(f => f.geometry.type === 'MultiPolygon').length)


        shpwrite.download(
            geoJSON,
            {
                file: filename,
                folder: filename,
                types: {
                    line: filename,
                    polyline: filename,
                    polygon: filename,
                    polygonm: filename,
                }
            }
        );

        return Promise.resolve()
    }

    updateLegendDomain() {
        const domains = {
            // 2040
            '46':[1, 5, 9, 20, 29, 79],
            '45':[69, 207, 473, 729, 1099, 2761],
            '47':[28, 86, 166, 274, 398, 1044],
            '48':[1.98, 2.54, 2.69, 2.77, 2.92, 3.26],
            '50':[33, 116, 237, 366, 557, 1383],
            '43':[22, 74, 192, 300, 483, 2997],
            '44':[7, 33, 51, 82, 161, 399],
            '42':[31, 111, 243, 402, 624, 3397],
            '41':[74, 213, 481, 750, 1134, 2801],
            // 2050
            '113':[33, 99, 219, 351, 538, 1299],
            '110':[2, 5, 11, 23, 34, 67],
            '109':[74, 187, 486, 760, 1111, 2862],
            '111':[30 ,83, 174, 285, 438, 1063],
            '112':[1.99, 2.44, 2.58, 2.68, 2.81, 3.07],
            '114':[36, 106, 233, 400, 605, 1399],
            '107':[24, 65, 200, 337, 472, 2660],
            '108':[3, 11, 17, 29, 67, 241],
            '106':[28, 76, 218, 361, 532, 2901],
            '105':[78, 195, 496, 74, 1148, 2898],
            // 2055
            '208':[38, 91, 227, 400, 581, 1429],
            '207':[32, 85, 218, 363, 543, 1337],
            '205':[30, 77, 173, 286, 408, 1133],
            '206':[2, 2, 3, 3, 3],
            '202':[3, 11, 16, 30, 66],
            '204':[2, 4, 10, 20, 29, 67],
            '203':[72, 172, 483, 749, 1070, 2944]
        }

        this.legend.domain = domains[this.filters.dataset.value] || domains["45"]
    }
    getBounds() {
        let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value,
            filtered = this.geographies.filter(({ value }) => geoids.includes(value));

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
            }
            else {
                window.localStorage.removeItem("macro-view-geographies")
            }
        }
    }

    init(map, falcor){
        let states = ["36","34","09","42"]
        falcor.get(['tig', 'views', 'byLayer', this.type], ["geo", states, "geoLevels"])
            .then(res => {
                let views = get(res, ['json', 'tig', 'views', 'byLayer', this.type], [])
                this.filters.dataset.domain = views.map(v => ({value: v.id, name: v.name})).sort((a,b) => a.name.localeCompare(b.name));
                this.filters.dataset.value = views.find(v => v.id === parseInt(this.vid)) ? parseInt(this.vid) : views[0].id

                this.updateLegendDomain()

                // geography setup
                let geo = get(res,'json.geo',{})
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
        let view = this.filters.dataset.value || this.vid

        return falcor.get(["tig", this.type.includes('2055') ? this.type : "sed_county", "byId", view, 'data_overlay'])
            .then(response =>{
                this.data = get(response, ["json", "tig", this.type.includes('2055') ? this.type : "sed_county", "byId", view, 'data_overlay'], [])

                this.legend.Title = this.filters.dataset.domain.filter(d => d.value.toString() === view.toString())[0].name
                this.updateLegendDomain()

                if(!this.filters.year.domain.length){
                    this.filters.year.domain = _.uniq(this.data.reduce((acc, curr) => [...acc, ...Object.keys(curr.data)], []));
                    this.filters.year.value = this.filters.year.domain[0];
                }
                let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value || []

                this.data_counties = this.data
                    .filter(item => geoids.includes(counties.filter(c => c.name === item.area)[0].geoid))
                    .map(item =>{
                    return counties
                        .reduce((a,c) =>{
                        if(item.area === c.name){
                            a['name'] = c.name
                            a['geoid'] = c.geoid
                        }
                        return a
                    },{})
                })
            })
    }


    onFilterChange(filterName,value,preValue){

        switch (filterName){
            case "year" : {
                this.filters.year.domain = _.uniq(this.data.reduce((acc, curr) => [...acc, ...Object.keys(curr.data)], []));
                this.filters.year.value = value;

                this.updateLegendDomain()
                break;
            }
            case "dataset":{
                this.legend.Title = `${this.filters.dataset.domain.filter(d => d.value.toString() === value.toString())[0].name}`

                this.updateLegendDomain()
                break;
            }
            case "geography": {
                //console.log('new geography', newValue)
                this.zoomToGeography(value);
                this.saveToLocalStorage();
                break;
            }
            default:{
                //do nothing
            }
        }

    }



    getColorScale(data) {
        return d3scale.scaleThreshold()
            .domain(this.legend.domain)
            .range(this.legend.range);
    }

    render(map, falcor) {
        if (!this.data){
            return this.fetchData(falcor)
        }
        if (this.data_counties && this.data_counties.length) {
            map.setFilter("Counties", ["in", ["get", "geoid"], ["literal", this.data_counties.map(d => d.geoid)]]);
        }
        else {
            map.setFilter("Counties", false);
        }

        this.processedData = this.data.reduce((acc,curr) =>{
            this.data_counties.forEach(data_county =>{
                if(curr.area === data_county.name){
                    acc.push({
                        id: data_county.geoid,
                        value: curr.data[this.filters.year.value]
                    })
                }
            })
            return acc
        },[])
        console.log('pd', this.processedData, this.data, this.data_counties, this.filters.year.value)

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

export const SED2040CountyLevelForecastLayerFactory = (options = {}) => new SED2040CountyLevelForecastLayer(options);
