import {LayerContainer} from "components/avl-map/src"
import { getColorRange } from "@availabs/avl-components"
import get from "lodash.get"
import _ from 'lodash'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import shpwrite from "../../../utils/shp-write";
import mapboxgl from "mapbox-gl";
import flatten from "lodash.flatten";
import * as d3scale from "d3-scale"
import counties from "../config/counties.json";

class SED2040TazLevelForecastLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId

        this.vid = props.vid
        this.type = props.type
        
        this.name = `${props.type.split('_')[2]} SED TAZ Level Forecast`
    }
    setActive = !!this.viewId
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
            type: 'select',
            domain: [],
            value: undefined,
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

            return this.data.reduce((a,c) =>{
                if(c.area === area_id){

                    a.push(
                        [this.filters.dataset.domain.reduce((a,c) => {
                            if(c.value === this.filters.dataset.value){
                                a = c.name
                            }
                            return a
                        },'')],
                        ["Year:", this.filters.year.value],
                        ["Taz id:",c.area],["Value:",c.data[this.filters.year.value]]
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

    download(){
        const filename = this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name +
            (this.filters.geography.value === 'All' ? '' : ` ${this.filters.geography.value}`);

        let d = this.data.reduce((acc,curr) =>{
            this.taz_ids.forEach(data_tract =>{
                if(curr.area === data_tract){
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
        console.log('d?', d)
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
            37:[0, 35696, 40620, 45755, 53519, 202112],
            34:[0, 1351, 2054, 2782, 3910, 78160],
            30:[0, 1, 3, 11, 50, 1201],
            29:[0, 1, 22, 118, 253, 12050],
            31:[0, 1, 7, 16, 56, 10503],
            28:[0, 11, 40, 200, 12050],
            26:[0, 44787, 61304, 80355, 113880, 1109731],
            27:[0, 2995, 4270, 5680, 7883, 117220],
            32:[0, 1112, 1588, 2112, 2958, 56390],
            33:[0, 2.3, 2.62, 2.83, 3.08, 7],
            36:[0, 66, 142, 276, 670, 48061],
            35:[0, 30, 78, 167, 385, 13225],
            13:[0, 489, 791, 1119, 1632, 42294],
            25:[0, 560, 1005, 1699, 3555, 80093],
            24:[0, 3090, 4361, 5816, 8083, 181241],
            38:[0, 1, 670, 2586, 8143, 51583]
        }

        this.legend.domain = domains[this.filters.dataset.value] || domains["37"]
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
        return falcor.get(["tig", "sed_taz", "byId", view, 'data_overlay'])
            .then(response =>{
                this.legend.Title = this.filters.dataset.domain.filter(d => d.value.toString() === view.toString())[0].name
                this.updateLegendDomain()

                let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value || []

                this.data = get(response, ["json", "tig", "sed_taz", "byId", view, 'data_overlay'], [])
                this.taz_ids = this.data.filter(item => geoids.includes(counties.filter(c => c.name === item.enclosing_name)[0].geoid)).map(d => d.area).filter(d => d)

                console.log('d?', this.data, geoids)
                if(!this.filters.year.domain.length){
                    this.filters.year.domain = _.uniq(this.data.reduce((acc, curr) => [...acc, ...Object.keys(curr.data)], []));
                    this.filters.year.value = this.filters.year.domain[0];
                }

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
                // do nothing
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
        if (this.taz_ids.length) {
            map.setFilter("nymtc_taz_2005", ["in", ["get", "name"], ["literal", this.taz_ids]]);
        }
        else {
            map.setFilter("nymtc_taz_2005", false);
        }
        this.processedData = this.data.reduce((acc,curr) =>{
            acc.push({
                'id': curr['area'] || '',
                'value': curr.data[this.filters.year.value]
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
