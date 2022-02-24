import {LayerContainer} from "components/avl-map/src"
import {useTheme} from "@availabs/avl-components";
import {filters} from 'pages/map/layers/npmrds/filters.js'
import get from "lodash.get";
import flatten from "lodash.flatten";
import shpwrite from "../../../utils/shp-write";
import mapboxgl from "mapbox-gl";
import {Link} from "react-router-dom";
import _ from "lodash";
import centroid from "@turf/centroid";

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
    'Transit': 'transit',
    'Truck': 'truck',
    'Bus': 'bus',
    'Bike': 'cycling',
    'Ferry': 'ferry',
    'Highway': 'highway',
    'Pedestrian': 'pedestrian',
    'Study': 'study',
    'Parking': 'parking',
    "ITS": 'its'
}

class RTPProjectDataLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId

        this.vid = props.vid
        this.type = props.type

    }

    active = false
    setActive = !!this.viewId
    name = 'RTP Project Data'
    filters = {
        geography: {...filters.geography},
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [],
            value: undefined,
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi: false
        },
        rtp_id: {
            name: 'RTP ID',
            type: 'dropdown',
            domain: [],
            value: "Select All",
            multi: false,
            searchable: true
        },
        year: {
            name: 'Year',
            type: 'dropdown',
            domain: ['Select All', 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2040],
            value: 'Select All'
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
        plan_portion: {
            name: 'Plan Portion',
            type: 'dropdown',
            domain: ['Select All', 'Constrained', 'Vision'],
            value: 'Select All',
            multi: false
        },
        sponsor: {
            name: 'Sponsor',
            type: 'dropdown',
            domain: [],
            value: 'Select All',
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
        show: true,
        Title: ""
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
        layers: ["county_lines", "county_polygons", "tip_lines", "tip_symbols", ...Object.values(symbols_map).map(t => 'poi-' + t)],
        callback: (layerId, features, lngLat) => {
            const feature = features.reduce((a, c) => {
                a = this.data.reduce((acc, curr) => {

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
                ['Year:', feature['year']],
                ['Plan Portion:', feature['plan_portion']],
                ['Sponsor:', feature['sponsor']],
                ['Project Type:', feature['ptype']],
                ['Cost:', feature['estimated_cost'] ? feature['estimated_cost'].toString() + 'M' : ''],
                ['Description:', feature['description'].toLowerCase()]
            ]
        },
        HoverComp: ({data, layer}) => {
            const theme = useTheme();

            return (
                <div className={`${theme.bg} rounded relative px-1 break-all`}>
                    <div key={'vit2'} className={`flex`}>
                        <div key={'vit0'}
                             style={{maxWidth: '250px'}}
                             className={`flex-1 font-bold mr-4`}>
                        </div>
                        <div key={'vit1'}
                             style={{maxWidth: '250px'}}
                             className={`whitespace-pre-wrap`}>
                            <Link to={`/views/${this.vid}/table?search=${data[0][1]}`}>view in table</Link>
                        </div>
                    </div>
                    {
                        data.map((row, i) =>
                            <div key={i} className="flex">
                                {
                                    row.map((d, ii) =>
                                        <div key={ii}
                                             style={{maxWidth: '250px'}}
                                             className={`
                                                    ${ii === 0 ? "flex-1 font-bold" : "whitespace-pre-wrap"}
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

    infoBoxes = [
        {
            Component: ({layer}) => {

                return (
                    <div className="relative pt-1">
                        <div className={'flex mt-5'}>
                            <label className={'self-center pr-1'} htmlFor={'search'}>RTP Project Search: </label>
                            <input
                                className={'p-1'}
                                id={'search'}
                                type={'text'}
                                name={'search'}
                                onChange={e => {
                                    let v = e.target.value
                                    if(!e.target.value.length){
                                        v = 'Select All'
                                    }
                                    layer.filters.rtp_id.onChange(v)
                                    layer.onFilterChange('rtp_id', v)
                                    layer.dispatchUpdate(layer, {rtp_id: v})
                                }}
                                placeholder={'search...'}/>
                        </div>
                    </div>
                )
            },
            width: 450
        }
    ]

    download() {
        const filename = this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name +
            (this.filters.geography.value === 'All' ? '' : ` ${this.filters.geography.value}`);

        let d = this.data
            .filter(d => {
                let f = Object.keys(this.filters)
                    .filter(f => !['geography', 'dataset'].includes(f) && this.filters[f].value !== 'Select All')
                    .reduce((acc, filter) => acc && d[filter === 'project_type' ? 'ptype' : filter] === this.filters[filter].value, true)

                return d.geography && f
            })
            .reduce((acc, curr) => {
                acc.push({
                    // geoid: data_tract.geoid,
                    ...{...curr.data},
                    geom: JSON.parse(curr.geom || '{}'),
                    area: curr.name,
                    "description": curr['description'],
                    "estimated_cost": curr['estimated_cost'],
                    "plan_portion": curr['plan_portion'],
                    "project_type": curr['ptype'],
                    "rtp_id": curr['rtp_id'],
                    "sponsor": curr['sponsor'],
                    "icon": symbols_map[curr['ptype']]
                })
                return acc
            }, [])
        let geoJSON = {
            type: 'FeatureCollection',
            features: []
        };

        d
            .map(t => {
                return {
                    type: "feature",
                    properties: Object.keys(t).filter(t => t !== 'geom').reduce((acc, curr) => ({
                        ...acc,
                        [curr]: t[curr]
                    }), {}),
                    geometry: t.geom
                }
            })
            .forEach((feat) => {
                let geom = feat.geometry;
                let props = feat.properties;

                if (geom.type === 'MultiPolygon') {
                    for (var i = 0; i < geom.coordinates.length; i++) {
                        var polygon = {
                            type: 'feature',
                            properties: props,
                            geometry: {
                                'type': 'Polygon',
                                'coordinates': geom.coordinates[i],
                            }
                        };
                        geoJSON.features.push(polygon)
                    }
                } else {
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

    updateLegendTitle() {
        this.legend.Title = `${this.source},
        ${this.filters.dataset.domain.reduce((a, c) => {
            if (c.value === this.filters.dataset.value) {
                a = c.name
            }
            return a
        }, '')}
                Year: ${this.filters.year.value === 'Select All' ? 'All' : this.filters.year.value}, 
                RTP Id: ${this.filters.rtp_id.value === 'Select All' ? 'All' : this.filters.rtp_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a, c) => {
            if (c === this.filters.project_type.value) {
                a = c === 'Select All' ? 'All' : c
            }
            return a
        }, '')},
                Plan Portion : ${this.filters.plan_portion.domain.reduce((a, c) => {
            if (c === this.filters.plan_portion.value) {
                a = c === 'Select All' ? 'All' : c
            }
            return a
        }, '')},
               Sponsor: ${this.filters.sponsor.domain.reduce((a, c) => {
            if (c === this.filters.sponsor.value) {
                a = c === 'Select All' ? 'All' : c
            }
            return a
        }, '')}
                `
    }

    getBounds() {
        let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value,
            filtered = this.geographies.filter(({value}) => geoids.includes(value));

        return filtered.reduce((a, c) => a.extend(c.bounding_box), new mapboxgl.LngLatBounds())
    }

    zoomToGeography(value) {
        if (!this.mapboxMap) return;

        if (value) {
            this.mapboxMap.easeTo({center: value, zoom: 10})
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


    init(map, falcor) {
        let states = ["36", "34", "09", "42"]

        falcor.get(['tig', 'views', 'byLayer', 'rtp_project_data'], ["geo", states, "geoLevels"])
            .then(res => {
                let views = get(res, ['json', 'tig', 'views', 'byLayer', this.type], [])
                this.source = get(views, [0, 'source_name'], '')
                this.filters.dataset.domain = views.map(v => ({
                    value: v.id,
                    name: v.name
                })).sort((a, b) => a.name.localeCompare(b.name));
                this.filters.dataset.value = views.find(v => v.id === parseInt(this.vid)) ? parseInt(this.vid) : views[0].id

                this.updateLegendDomain()

                // geography setup
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
        let view = this.filters.dataset.value || this.vid

        return falcor.get(["tig", this.type, "byId", view, 'data_overlay'])
            .then(response => {

                this.data = get(response, ['json', "tig", this.type, "byId", view, 'data_overlay'], []);

                this.filters.sponsor.domain = ['Select All', ..._.uniq(this.data.map(d => d.sponsor))]
                this.filters.rtp_id.domain = ['Select All', ..._.uniq(this.data.map(d => d.rtp_id))]

                this.updateLegendTitle()

            })
    }

    onFilterChange(filterName, value, preValue) {
        this.updateLegendTitle(value)
        switch (filterName) {
            case "geography": {
                this.zoomToGeography();
                this.saveToLocalStorage();
                break;
            }
            case "rtp_id": {
                if (value === 'Select All') {
                    this.zoomToGeography();
                } else {
                    let geom = JSON.parse(get(this.data.filter(d => d.rtp_id === value), [0, 'geom'], '{}'))
                    if (geom && Object.keys(geom).length) {
                        this.zoomToGeography(get(centroid(geom), ['geometry', 'coordinates']))
                    }
                }
                break;
            }
            default: {
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

        let iconSizes = {
            rail: 1,
            bus: 1,
            ferry: 1,
            parking: 1
        }

        geojson.features = this.data
            .filter(d => {
                let f = Object.keys(this.filters)
                    .filter(f => !['geography', 'dataset'].includes(f) && this.filters[f].value !== 'Select All')
                    .reduce((acc, filter) => {
                        return acc && d[filter === 'project_type' ? 'ptype' : filter] === this.filters[filter].value
                    }, true)

                return d.geography && f
            }).map((d, i) => {

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

        polygon_geojson.features.forEach(feature => {

            feature.properties['color'] = symbology.reduce((a, c) => {
                if (c.label === feature.properties.project_type) {
                    a = c.color
                }
                return a
            }, '')
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


        line_geojson.features.forEach(feature => {

            feature.properties['color'] = symbology.reduce((a, c) => {
                if (c.label === feature.properties.project_type) {
                    a = c.color
                }
                return a
            }, '')
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
                        type: 'identity',
                        property: 'color'
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
                        type: 'identity',
                        property: 'color'
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
                if (!this.mapboxMap.getLayer(layerID)) {
                    this.mapboxMap.loadImage(`mapIcons/${symbol}.png`,
                        (error, image) => {
                            if (error) return 0;
                            if (!this.mapboxMap.hasImage(symbol)) {
                                this.mapboxMap.addImage(symbol, image);
                            }

                            if (!this.mapboxMap.getLayer(layerID)) {
                                this.mapboxMap.addLayer({
                                    'id': layerID,
                                    'type': 'symbol',
                                    'source': 'county_symbols',
                                    'layout': {
                                        'icon-image': symbol,
                                        'icon-allow-overlap': true,
                                        'icon-size': iconSizes[symbol] || 0.4
                                    },
                                    'filter': ['==', 'icon', symbol]
                                })
                            }
                        }
                    )

                }
            }
        })

    }
}

export const RTPProjectDataLayerFactory = (options = {}) => new RTPProjectDataLayer(options)
