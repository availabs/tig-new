import React from 'react'
import {LayerContainer} from "components/avl-map/src"
import { getColorRange } from "components/avl-components/src"
import get from "lodash.get"
import _ from 'lodash'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import shpwrite from "../../../utils/shp-write";
import mapboxgl from "mapbox-gl";
import flatten from "lodash.flatten";
import * as d3scale from "d3-scale"
import counties from "../config/counties.json";
import centroid from "@turf/centroid";
import {ckmeans} from 'simple-statistics'
import TypeAhead from "components/tig/TypeAhead";
import Slider from 'rc-slider';

class SEDTazLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId

        this.vid = props.vid
        this.type = props.type
        
        this.name = `${props.type.split('_')[2]} SED TAZ Level Forecast`
    }

    attribution = <div className={'text-sm grid grid-col-1 gap-4'}>
        <p id="attribution-VB4LXV">Urban Area Boundary map data © <a href="http://nymtc.org/">NY Metropolitan Transportation Council</a></p>
        <p id="attribution-42">TAZ map data © <a href="http://nymtc.org/">NY Metropolitan Transportation Council</a></p>
    </div>

    setActive = !!this.viewId
    taz_ids = []
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
        layers: ["maine"],
        callback: (layerId, features, lngLat) => {

            const area_id = features.reduce((a,c) => {
                a = get(c,['properties','name'],'')
                return a
            },'')
            return this.data.reduce((a,c) =>{
                if(c.id === area_id && !a.length){

                    a.push(
                        [<div className='text-sm'>{this.filters.dataset.domain.reduce((a,c) => {
                            if(+c.value === +this.filters.dataset.value){
                                a = c.name + ' (in 000s)'
                            }
                            return a
                        },'')}</div>],
                        ["Year:", this.filters.year.value],
                        ["Taz id:",c.id],["Value:",c.value.toLocaleString()]
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
                type: "geojson",
                data: {
                    "type": "FeatureCollection",
                    "features": []
                }
            }
        }
    ]
    layers = [
        {
            id: "nymtc_taz_2005",
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
        },
        {
            id: "nymtc_taz_2005-line",
            source: "nymtc_taz_2005-93y4h2",
            type: "line",
            paint: {
                "line-color": '#000',
                "line-width": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    2,
                    0
                ]
            }
        },
        {
            'id': 'maine',
            'type': 'fill',
            'source': 'nymtc_taz_2005-93y4h2', // reference the data source
            'layout': {},
            'paint': {
            'fill-color': '#0080ff', // blue color fill
            'fill-opacity': 0.5
            }
        }
    ]
    legend = {
        type: "quantile",
        domain: [],
        range: getColorRange(5, "YlOrRd", true),
        show: false,
        Title: "",
        units: ' (in 000s)',
        format: ",d",

    }

    infoBoxes = [
       
        {
            Component: ({layer}) => {
                let yearMarks = layer.filters.year.domain.reduce((out,yr) => {
                   out[yr] = ''+yr
                   return out 
                },{})
                return (
                    <div className="relative border-top">
                        <div className="relative border-top">
                            <div className={'p-1 w-full'}>
                                {layer.Title}
                            </div>
                        </div>
                        
                        <TypeAhead
                            classNameMenu={'border-b hover:bg-blue-300'}
                            suggestions={layer.taz_ids}
                            setParentState={e => {
                                if (!e.length) {
                                    e = 'Select All'
                                }
                                layer.onFilterChange('taz', e)
                                layer.dispatchUpdate(layer, {taz: e})
                            }}
                            placeholder={'Search TAZ...'}
                        />

                        <div className={'p-2 text-sm text-gray-500'}>Year: {layer.filters.year.value}</div>
                            
                        <div className=" pb-6 px-3 ">
                            <Slider 
                                min={Math.min(...layer.filters.year.domain)} 
                                max={Math.max(...layer.filters.year.domain)} 
                                marks={yearMarks} 
                                step={null}

                                onChange={value => {
                                        if(value){
                                            layer.filters.year.onChange()
                                            layer.onFilterChange('year', value)
                                        }
                                    }}
                                defaultValue={Math.min(...layer.filters.year.domain)} 
                            />
                        </div>
                        
                    </div>
                )
            },
            width: 250
        },

    ]

    download(setLoading){
        let year = this.type.split('_')[2];
        const filename = this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name +
            (this.filters.geography.value === 'All' ? '' : ` ${this.filters.geography.value}`);

        let d = this.data.reduce((acc,curr) =>{
            this.taz_ids.forEach(data_tract =>{
                let values = Object.keys(this.fullData).reduce((acc, year) => {
                    acc[year] = get(this.fullData[year].filter(data => data.area === data_tract), [0, 'value']);
                    return acc;
                } , {})
                if(curr.area === data_tract){
                    acc.push({
                        ...values,
                        geom: curr.geom,
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

        return Promise.resolve(shpwrite.download(
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
        )).then(setLoading(false));
    }

    updateLegendDomain(data) {
     let values = _.uniq((data || []).map(d => get(d, ['value'], 0)))

        if(values.length){
            this.legend.domain =
                ckmeans(values, Math.min(values.length, 5)
                ).reduce((acc, d, dI) => {
                    if(dI === 0){
                        acc.push(d[0], d[d.length - 1])
                    }else{
                        acc.push(d[d.length - 1])
                    }
                    return acc
                } , [])
        }else{
            this.legend.domain = [0,10,25,50,100]
        }
        this.updateLegendTitle()
    }

    updateLegendTitle() {
        this.Title = <div>
                <div>{this.source}</div>
                <div className='text-sm text-italic font-light'>{
                    this.filters.dataset.domain.reduce((acc, d) => {
                        if(d.value === this.filters.dataset.value){
                            acc = d.name
                        }
                        return acc;
                    }, '')
                }</div>
                <div className='text-sm text-italic font-light'>Year: {this.filters.year.value}</div>
        </div>
    }

    getBounds() {
        let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value,
            filtered = this.geographies.filter(({ value }) => geoids.includes(value));
        return filtered.reduce((a, c) => a.extend(c.bounding_box), new mapboxgl.LngLatBounds())
    }

    zoomToGeography(value) {
        if (!this.mapboxMap) return;

        if (value) {
            this.mapboxMap.easeTo({center: value, zoom: 11})
            return;
        }

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

        this.defaultZoom = options;

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
                this.source = get(views, [0, 'source_name'], '')
                this.filters.dataset.domain = views.map(v => ({value: v.id, name: v.name})).sort((a,b) => a.name.localeCompare(b.name));
                this.filters.dataset.value = views.find(v => v.id === parseInt(this.vid)) ? parseInt(this.vid) : get(views, [0, 'id'])
                //console.log('hello', this.source, views, this.filters.dataset.value, parseInt(this.vid))

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
                //this.zoomToGeography();

            })
    }

    fetchData(falcor) {
        let view = this.filters.dataset.value || this.vid;
          
            //path = ['tig', 'source', `${year} SED ${srcType} Level Forecast Data`, 'view', view, 'schema', 'sed_taz']

        
        return falcor.get(
            ['tig','byViewId', view, 'source_id']
        )
            .then((response) => {
                let source_id = get(response, ['json','tig','byViewId', view, 'source_id'], null)
                //console.log('source_id', source_id, response)
                if (source_id) {
                    console.time('get sed taz data')
                    return falcor.get(['tig','sed_taz','bySource',source_id,'data'])
                        .then(data => {
                            let sourceData = get(data, ['json','tig','sed_taz','bySource',source_id,'data'], {geo: {type:'FeatureCollection', features:[]}, data: {}})
                            // console.log(sourceData)
                            let years = []
                            try {
                                years = Object.keys(Object.values(Object.values(sourceData.data)[0])[0])
                            } catch (err) {
                                console.log('invalid data')
                            }
                            if(this.filters.year.domain.length === 0) {
                                this.filters.year.domain = years.map(d => +d)
                                this.filters.year.value = years[0]
                            }
                            console.log('sedData', sourceData)
                            console.timeEnd('get sed taz data')
                        })
                } else {
                    return []
                }  
            })
    }

    onFilterChange(filterName,value,preValue){
        switch (filterName){
            case "year" : {
                this.filters.year.value = value;
                //this.data = this.fullData[this.filters.year.value] || [];

                // if(value && document.getElementById(`yearRange-${this.id}`) && document.getElementById(`yearRange-${this.id}`).value.toString() !== this.filters.year.domain.indexOf(value).toString()){
                //     document.getElementById(`yearRange-${this.id}`).value = this.filters.year.domain.indexOf(value).toString()
                // }
                this.dispatchUpdate(this, {year: value})
                this.updateLegendDomain()
                break;
            }
            case "dataset":{
                this.updateLegendDomain()
                break;
            }

            case "geography": {
                this.zoomToGeography();
                this.saveToLocalStorage();
                break;
            }

            case "taz": {
                let geom = this.parseIfSTR(get(this.data.find(d => d.area === value), ['geom']) || '{}')
                if (geom && Object.keys(geom).length) {
                    let featId;
                    if(this.featMapping){
                        featId = this.featMapping.get(value)
                    }else{
                        this.featMapping = new Map();
                        this.mapboxMap.queryRenderedFeatures()
                            .filter(feats => feats.properties.area)
                            .map(feats => this.featMapping.set(feats.properties.area, feats.id))

                        featId = this.featMapping.get(value)
                    }

                    if(featId){
                        this.featId && this.mapboxMap.setFeatureState(
                            { source: 'nymtc_taz_2005-93y4h2', id: this.featId},
                            { hover: false }
                        );
                        this.mapboxMap.setFeatureState(
                            { source: 'nymtc_taz_2005-93y4h2', id: featId},
                            { hover: true }
                        );
                        this.featId = featId;
                    }
                    this.zoomToGeography(get(centroid(geom), ['geometry', 'coordinates']))
                }else{
                    this.featId && this.mapboxMap.setFeatureState(
                        { source: 'nymtc_taz_2005-93y4h2', id: this.featId},
                        { hover: false }
                    );

                    this.featId = null;
                    this.zoomToGeography();
                }
                break;
            }

            default:{
                // do nothing
            }
        }

    }

    getColorScale(value) {
        if(!this.legend.domain.length) return null;
        let color = null
        this.legend.domain
            .forEach((v, i) => {
                if(value >= v && value <= this.legend.domain[i+1]){
                    color = this.legend.range[i];
                }
            });
        return color;
    }

    parseIfSTR(blob) {
        return typeof blob === 'string' ? JSON.parse(blob) : blob
    }

    render(map, falcor) {
        console.time('render time')
        let year = this.filters.year.value || 2020,
            view = this.filters.dataset.value || this.vid,
            falcorCache = falcor.getCache(),
            source_id = get(falcorCache, ['tig','byViewId', view, 'source_id','value'], null);

        if(!source_id) return

        let sourceData = get(falcorCache, ['tig','sed_taz','bySource',source_id,'data','value'], {geo: {type:'FeatureCollection', features:[]}, data: {}})
        get(sourceData,'geo.features', []).forEach(f => f.geometry = this.parseIfSTR(f.geometry))

        // console.log('testing', sourceData)
        // if (this.taz_ids.length) {
        //     map.setFilter("nymtc_taz_2005", ["in", ["get", "area"], ["literal", this.taz_ids]]);
        //     map.setFilter("nymtc_taz_2005-line", ["in", ["get", "area"], ["literal", this.taz_ids]]);
        // }
        // else {
            map.setFilter("nymtc_taz_2005", false);
            map.setFilter("nymtc_taz_2005-line", false);
        // }

        map.getSource('nymtc_taz_2005-93y4h2').setData(sourceData.geo)

        let processedData = Object.keys(sourceData.data).reduce((acc,area_id) =>{
            acc.push({
                'id': area_id || '',
                'value': get(sourceData.data, `[${area_id}][${view}][${year}]`,0)
            })
            return acc
        },[])
        this.data = processedData

        // console.log('maine', processedData)
        this.updateLegendDomain(processedData)

        const colors = processedData.reduce((a,c) =>{
                a[c.id] = this.getColorScale(c.value) || '#f00'
                return a
            },{})

        //console.log('colors', colors)

        map.setPaintProperty("maine", "fill-color", [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#090",
            ["get", ["get", "name"], ["literal", colors]]
        ])
        console.timeEnd('render time')
    }
}

export const SEDTazLayerFactory = (options = {}) => new SEDTazLayer(options);