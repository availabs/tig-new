import {useTheme} from "@availabs/avl-components";
import {HOST} from './layerHost'
import {LayerContainer} from "components/avl-map/src"
import {filters} from 'pages/map/layers/npmrds/filters.js'
import tip_ids from '../config/tip_ids.json'
import tip_mpos from '../config/tip_mpos.json'
import fetcher from "../wrappers/fetcher";
import get from "lodash.get";
import flatten from "lodash.flatten";
import shpwrite from "../../../utils/shp-write";
import mapboxgl from "mapbox-gl";

var parse = require('wellknown');

const symbology = [
    {
        "color": "#38A800",
        "value": "Bike",
        "label": "Bike"
    },
    {
        "color": "#0070FF",
        "value": "Bus",
        "label": "Bus"
    },
    {
        "color": "#D79E9E",
        "value": "Ferry",
        "label": "Ferry"
    },
    {
        "color": "#FFF",
        "value": "Highway",
        "label": "Highway"
    },
    {
        "color": "#FF00C5",
        "value": "ITS",
        "label": "ITS"
    },
    {
        "color": "#B1FF00",
        "value": "Pedestrian",
        "label": "Pedestrian"
    },
    {
        "color": "#9C9C9C",
        "value": "Rail",
        "label": "Rail"
    },
    {
        "color": "#FFAA00",
        "value": "Study",
        "label": "Study"
    },
    {
        "color": "#00C5FF",
        "value": "Transit",
        "label": "Transit"
    },
    {
        "color": "#000",
        "value": "Truck",
        "label": "Truck"
    }
]

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

const nameMapping = {
    project_type: 'ptype',
    mpo_name: 'mpo'
}

class TestTipLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId

        this.vid = props.vid
        this.type = props.type

    }

    setActive = !!this.viewId
    name = 'TIP Mappable Projects'
    filters = {
        geography: {...filters.geography},
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                // {value:'131', name:'2014-2018 TIP Mappable Projects'},
                // {value:'64', name:'2017-2021 TIP Mappable Projects'},
                // {value:'187',name:'2020-2024 TIP Mappable Projects'}
            ],
            value: undefined,
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
                "Select All",
                "Study",
                "Highway",
                "Ferry",
                "Transit",
                "Rail",
                "Truck",
                "Pedestrian",
                "Bike",
                "Bus",
                "ITS",
                "Parking"
            ],
            value: 'Select All',
            multi: false
        },
        mpo_name: {
            name: 'MPO Name',
            type:'dropdown',
            domain: tip_mpos,
            value: 'Select All',
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
                a = this.data.reduce((acc, curr) => {
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
        },
        HoverComp: ({data, layer}) => {
            const theme = useTheme();
            return (
                <div style={{maxHeight: '300px'}} className={`${theme.bg} rounded relative px-1 overflow-auto scrollbarXsm`}>
                    {
                        data.map((row, i) =>
                            <div key={i} className="flex">
                                {
                                    row.map((d, ii) =>
                                        <div key={ii}
                                             style={{maxWidth: '200px'}}
                                             className={`
                                                    ${ii === 0 ? "flex-1 font-bold" : "overflow-auto scrollbarXsm"}
                                                    ${row.length > 1 && ii === 0 ? "mr-4" : ""}
                                                    ${row.length === 1 && ii === 0 ? `border-b-2 text-lg ${i > 0 ? "mt-1" : ""}` : ""}
                                                    `}>
                                            {d}
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                </div>
            )
        },
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

    download(){
        const filename = this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name +
            (this.filters.geography.value === 'All' ? '' : ` ${this.filters.geography.value}`);

        let d = this.data
            .filter(d => {
                let f = Object.keys(this.filters)
                    .filter(f => !['geography', 'dataset'].includes(f) && this.filters[f].value !== 'Select All')
                    .reduce((acc, filter) => acc && d[nameMapping[filter] || filter] === this.filters[filter].value, true)

                return d.geography && f
            })
            .reduce((acc,curr) =>{
                acc.push({
                    // geoid: data_tract.geoid,
                    ...{...curr.data},
                    geom: JSON.parse(curr.geom || '{}'),
                    area: curr.name,
                    "description": curr['description'],
                    "cost": curr['cost'],
                    "mpo": curr['mpo'],
                    "project_type": curr['ptype'],
                    "tip_id": curr['tip_id'],
                    "sponsor": curr['sponsor'],
                    "icon": symbols_map[curr['ptype']]
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


        shpwrite.download(
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
        );

        return Promise.resolve()
    }

    updateLegendDomain() {
        this.legend.domain = symbology.map(d => d.value)
        this.legend.range = symbology.map(d => d.color)
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

        const url = `${HOST}/views/${this.filters.dataset.value}/data_overlay`
        const cost_lower = ''
        const cost_upper = ''
        const params = `?utf8=%E2%9C%93&tip_id=${this.filters.tip_id.value === 'Select All'? '':this.filters.tip_id.value}&ptype=${this.filters.project_type.value === 'Select All'? '':this.filters.project_type.value}&mpo=${this.filters.mpo_name.value === 'Select All'? '':this.filters.mpo_name.value}&sponsor=${this.filters.agency.value === 'Select All'? '':this.filters.agency.value}&cost_lower=${cost_lower}&cost_upper=${cost_upper}&commit=Filter`

        if(this.vid){
            console.log('view id', this.vid)
            falcor.get(['tig', 'views', 'byLayer', 'tip'], ["geo", states, "geoLevels"])
                .then(res => {
                    let views = get(res, ['json', 'tig', 'views', 'byLayer', this.type], [])
                    console.log(res, views)

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

       
    }

    updateLegendTitle() {
        this.legend.Title = `${this.filters.dataset.domain.reduce((a,c) =>{
            if(c.value === this.filters.dataset.value){
                a = c.name
            }
            return a
        },'')}
                TIP Id: ${this.filters.tip_id.value === 'Select All'? 'All':this.filters.tip_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a,c) =>{
            if(c === this.filters.project_type.value){
                a = c === 'Select All' ? 'All': c
            }
            return a
        },'')},
                MPO Name: ${this.filters.mpo_name.domain.reduce((a,c) =>{
            if(c === this.filters.mpo_name.value){
                a = c === 'Select All' ? 'All': c
            }
            return a
        },'')},
               Agency: ${this.filters.agency.value === 'Select All'? 'All':''}
                `
    }

    fetchData(falcor) {
        let view = this.filters.dataset.value || this.vid

        return falcor.get(["tig", this.type, "byId", view, 'data_overlay'])
            .then(response => {
                this.data = get(response, ['json', "tig", this.type, "byId", view, 'data_overlay'],[]);
                this.updateLegendTitle()

            })
    }

    onFilterChange(filterName,value,preValue){
        this.updateLegendTitle()
        switch (filterName){
            case "geography": {
                this.zoomToGeography(value);
                this.saveToLocalStorage();
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
        if(!this.data) {

            return this.fetchData()
        }
        let geojson = {
            type: "FeatureCollection",
            features: []
        }
        
        let colors = symbology.reduce( (out,curr) => {
            out[curr.value] = curr.color
            return out;
        }, {})

         geojson.features = this.data
             .filter(d => {
                 let f = Object.keys(this.filters)
                     .filter(f => !['geography', 'dataset'].includes(f) && this.filters[f].value !== 'Select All')
                     .reduce((acc, filter) => {
                         return acc && d[nameMapping[filter] || filter] === this.filters[filter].value
                     }, true)

                 return d.geography && f
             })
             .map((d,i) => {
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

        if (this.mapboxMap.getSource('tip_symbols')) {
            this.mapboxMap.getSource('tip_symbols').setData(symbols_geojson)
        }

        if(this.mapboxMap.getSource('tip_lines')){
            this.mapboxMap.getSource('tip_lines').setData(line_geojson)
        }

        if(!this.mapboxMap.getLayer('tip_lines')){
            this.mapboxMap.addLayer({
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
                if (!this.mapboxMap.getLayer(layerID)) {
                    this.mapboxMap.addLayer({
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

