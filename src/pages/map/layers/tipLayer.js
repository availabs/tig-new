import {useTheme} from "@availabs/avl-components";
import {LayerContainer} from "components/avl-map/src"
import {filters} from 'pages/map/layers/npmrds/filters.js'
import tip_mpos from '../config/tip_mpos.json'
import get from "lodash.get";
import flatten from "lodash.flatten";
import shpwrite from "../../../utils/shp-write";
import mapboxgl from "mapbox-gl";
import {Link} from "react-router-dom";
import _ from 'lodash'
import centroid from '@turf/centroid'

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
            multi: false
        },
        tip_id: {
            name: 'Tip ID',
            type: 'dropdown',
            domain: [],
            value: 'Select All',
            multi: false,
            searchable: true
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
            type: 'dropdown',
            domain: tip_mpos,
            value: 'Select All',
            multi: false
        },
        sponsor: {
            name: 'Sponsor',
            type: 'dropdown',
            domain: ['Select All'],
            value: 'Select All'
        },

    }
    legend = {
        type: "ordinal",
        domain: [],
        range: [],
        icons: [],
        height: 5,
        width: 350,
        direction: "vertical",
        show: true,
        Title: ""
    }
    onHover = {
        layers: ["tip_lines", "tip_symbols", ...Object.values(symbols_map).map(t => 'tip-' + t)],
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
                ['County:', feature['name']],
                ['MPO:', feature['mpo']],
                ['Sponsor:', feature['sponsor']],
                ['Project Type:', feature['ptype']],
                ['Cost:', feature['cost']],
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

    infoBoxes = [
        {
            Component: ({layer}) => {

                return (
                    <div className="relative pt-1">
                        <div className={'flex mt-5'}>
                            <label className={'self-center pr-1'} htmlFor={'search'}>TIP Project Search: </label>
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
                                    layer.filters.tip_id.onChange(v)
                                    layer.onFilterChange('tip_id', v)
                                    layer.dispatchUpdate(layer, {tip_id: v})
                                }}
                                placeholder={'search...'}/>
                        </div>
                    </div>
                )
            },
            width: 450
        }
    ]

    download(setLoading) {
        const filename = this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name +
            (this.filters.geography.value === 'All' ? '' : ` ${this.filters.geography.value}`);

        let d = this.data
            .filter(d => {
                let f = Object.keys(this.filters)
                    .filter(f => !['geography', 'dataset'].includes(f) && this.filters[f].value !== 'Select All')
                    .reduce((acc, filter) => acc && d[nameMapping[filter] || filter] === this.filters[filter].value, true)

                return d.geography && f
            })
            .reduce((acc, curr) => {
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

    updateLegendDomain() {
        this.legend.domain = symbology.map(d => d.value)
        this.legend.range = symbology.map(d => d.color)
        this.legend.icons = this.legend.domain.map(i => `mapIcons/${symbols_map[i]}.png`)
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

        falcor.get(['tig', 'views', 'byLayer', 'tip'], ["geo", states, "geoLevels"])
            .then(res => {
                let views = get(res, ['json', 'tig', 'views', 'byLayer', this.type], [])
                this.source = get(views, [0, 'source_name'], '')
                this.filters.dataset.domain = views.map(v => ({
                    value: v.id,
                    name: v.name
                })).sort((a, b) => a.name.localeCompare(b.name));
                this.filters.dataset.value = views.find(v => v.id === parseInt(this.vid)) ? parseInt(this.vid) : views[0].id

                this.updateLegendDomain()
                this.updateLegendTitle()

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

    updateLegendTitle() {
        this.legend.Title = `${this.source},
        ${this.filters.dataset.domain.reduce((a, c) => {
            if (c.value === this.filters.dataset.value) {
                a = c.name
            }
            return a
        }, '')}
                TIP Id: ${this.filters.tip_id.value === 'Select All' ? 'All' : this.filters.tip_id.value},
                Project Type: ${this.filters.project_type.domain.reduce((a, c) => {
            if (c === this.filters.project_type.value) {
                a = c === 'Select All' ? 'All' : c
            }
            return a
        }, '')},
                MPO Name: ${this.filters.mpo_name.domain.reduce((a, c) => {
            if (c === this.filters.mpo_name.value) {
                a = c === 'Select All' ? 'All' : c
            }
            return a
        }, '')},
               sponsor: ${this.filters.sponsor.value === 'Select All' ? 'All' : ''}
                `
    }

    fetchData(falcor) {
        let view = this.filters.dataset.value || this.vid

        return falcor.get(["tig", this.type, "byId", view, 'data_overlay'])
            .then(response => {
                this.data = get(response, ['json', "tig", this.type, "byId", view, 'data_overlay'], []);

                this.filters.sponsor.domain = ['Select All', ..._.uniq(this.data.map(d => d.sponsor))]
                this.filters.tip_id.domain = ['Select All', ..._.uniq(this.data.map(d => d.tip_id))]

                this.updateLegendTitle()

            })
    }

    onFilterChange(filterName, value, preValue) {
        this.updateLegendTitle()
        switch (filterName) {
            case "geography": {
                this.zoomToGeography();
                this.saveToLocalStorage();
                break;
            }
            case "tip_id": {
                if (value === 'Select All') {
                    this.zoomToGeography();
                } else {
                    let geom = JSON.parse(get(this.data.filter(d => d.tip_id === value), [0, 'geom'], '{}'))
                    if(geom && Object.keys(geom).length){
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

    render(map) {
        if (!this.data) {

            return this.fetchData()
        }
        let geojson = {
            type: "FeatureCollection",
            features: []
        }

        let colors = symbology.reduce((out, curr) => {
            out[curr.value] = curr.color
            return out;
        }, {})

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
                        return acc && d[nameMapping[filter] || filter] === this.filters[filter].value
                    }, true)

                return d.geography && f
            })
            .map((d, i) => {
                return {
                    "type": "Feature",
                    id: i,
                    "properties": {
                        county: d.county,
                        description: d.description,
                        estimated_cost: d.cost,
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

        if (this.mapboxMap.getSource('tip_lines')) {
            this.mapboxMap.getSource('tip_lines').setData(line_geojson)
        }

        if (!this.mapboxMap.getLayer('tip_lines')) {
            this.mapboxMap.addLayer({
                'id': 'tip_lines',
                'type': 'line',
                source: 'tip_lines',
                paint: {
                    'line-width': 3,
                    'line-color': {
                        type: 'identity',
                        property: 'color'
                    },
                }
            })
        }


        geojson.features.forEach(feature => {
            if (feature.properties.icon) {
                let symbol = feature.properties.icon
                let layerID = 'tip-' + symbol;
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
                                    'source': 'tip_symbols',
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


export const TestTipLayerFactory = (options = {}) => new TestTipLayer(options);
