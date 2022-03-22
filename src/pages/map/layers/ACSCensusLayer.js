import {LayerContainer} from "components/avl-map/src"
import tracts from '../config/tracts.json'
import {getColorRange} from "@availabs/avl-components"
import get from "lodash.get"
import _ from 'lodash'
import * as d3scale from "d3-scale"
import {filters} from 'pages/map/layers/npmrds/filters.js'
import mapboxgl from "mapbox-gl";
import flatten from "lodash.flatten";
import centroid from "@turf/centroid";
import {download as shpDownload} from "utils/shp-write";
import TypeAhead from "../../../components/tig/TypeAhead";

class ACSCensusLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.categoryName = props.name
        this.viewid = props.viewId
        this.vid = props.vid
    }

    setActive = !!this.viewId
    name = 'ACS Census Layer'
    data_tracts = []
    filters = {
        geography: {...filters.geography},
        dataset: {
            name: 'Dataset',
            type: 'dropdown',
            domain: [
                'Absolute and Relative Minority Population data',
                'Absolute and Relative Population Below Poverty'
            ],
            value: this.categoryName,
            multi: false,
            accessor: d => d.name,
            valueAccessor: d => d.value,
        },
        column:{
            name: 'Column',
            type: 'dropdown',
            domain: [],
            value: 'value',
            accessor: d => d.name,
            valueAccessor: d => d.value,
            multi: false
        },
    }
    legend = {
        type: "quantile",
        range: getColorRange(5, "YlOrRd", true),
        domain: [],
        show: false,
        Title: "",
        format: ',d',
    }

    onHover = {
        layers: ["tracts"],
        callback: (layerId, features, lngLat) => {
            const geoid = features.reduce((a, c) => {
                a = get(c, ['properties', 'GEOID'], '')
                return a
            }, '')
            const graph = tracts.reduce((a, c) => {
                if (c.geoid === geoid) {
                    a = c
                }
                return a
            }, {})

            const col = this.filters.column.domain.filter(d => d.value === this.filters.column.value)[0].name
            return this.data.reduce((a, c) => {
                if (c.area === graph['name']) {
                    a.push(
                        ['Tract', `${c.area}-${graph['state_code']}`],
                        [col, this.filters.column.value === 'percentage' ? c[this.filters.column.value].toFixed(2) + '%' : c[this.filters.column.value]]
                    )
                }
                return a
            }, []).sort()

        }
    }

    sources = [
        {
            id: "nymtc_census_tracts",
            source: {
                type: "vector",
                url: "mapbox://am3081.3galhyzy"
            }
        }
    ]
    layers = [
        {
            id: "tracts",
            filter: false,
            "source-layer": "census_tracts",
            source: "nymtc_census_tracts",
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
            id: "tracts-line",
            filter: false,
            "source-layer": "census_tracts",
            source: "nymtc_census_tracts",
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
        }
    ]

    infoBoxes = [
        {
            Component: ({layer}) => {

                return (
                    <div className="relative border-top">
                        <div className={'p-1 w-full'}>
                            {layer.Title}
                        </div>
                    </div>
                )
            },
            width: 450
        },
        {
            Component: ({layer}) => {

                return (
                    <div className="relative border-top">
                        <div className={''}>
                            <label className={'self-center mr-1 text-sm font-light'} htmlFor={'search'}>Tract Search:</label>
                            <TypeAhead
                                className={'p-1 w-full border'}
                                classNameMenu={'border-b hover:bg-blue-300'}
                                suggestions={layer.data_tracts.map(t => t.name)}
                                setParentState={e => {
                                    if (!e.length) {
                                        e = 'Select All'
                                    }
                                    layer.onFilterChange('census_tract', e)
                                    layer.dispatchUpdate(layer, {census_tract: e})
                                }}
                                placeholder={'ex: Ulster:9517'}
                            />
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

        let d = this.data.reduce((acc, curr) => {
            this.data_tracts.forEach(data_tract => {
                if (curr.area === data_tract.name) {
                    acc.push({
                        id: data_tract.geoid,
                        value: curr.value,
                        percentage: curr.percentage,
                        geom: JSON.parse(curr.geom),
                        name: curr.area,
                        type: curr.type
                    })
                }
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
                    properties: {geoid: t.id, value: t.value, percent: t.percentage, area: t.name, area_type: t.type},
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
        console.log('counts', _.uniq(geoJSON.features.map(f => f.geometry.type)), geoJSON.features.filter(f => f.geometry.type === 'Polygon').length, geoJSON.features.filter(f => f.geometry.type === 'MultiPolygon').length)


        return Promise.resolve(shpDownload(
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

    updateColumnNames() {
        this.filters.column.domain =
            ['128', '143', '133', '18'].includes((this.filters.dataset.value).toString()) ?
                [
                    {name: 'Population Below Poverty', value: 'value'},
                    {name: 'Percent Below Poverty', value: 'percentage'}
                ] :
                [
                    {name: 'Minority Population', value: 'value'},
                    {name: 'Percent Minority', value: 'percentage'}
                ]
    }

    updateLegendDomain() {
        const domains = {
            '22-value': [0, 300, 756, 1432, 2553, 21552], '22-percentage': [0, 8.03, 19.34, 39.08, 70.41, 100],
            '132-value': [0, 370, 861, 1573, 2728, 23217], '132-percentage': [0, 9.92, 22, 42.67, 73.73, 100],
            '134-value': [0, 400, 883, 1608, 2738, 23665], '134-percentage': [0, 10.45, 22.51, 42.90, 73.93, 100],
            '142-value': [0, 410, 897, 1610, 2736, 24223], '142-percentage': [0, 10.81, 22.80, 42.95, 73.53, 100],
            '18-value': [0, 129, 257, 459, 897, 4959], '18-percentage': [0, 3.53, 6.9, 12.63, 22.92, 100],
            '128-value': [0, 140, 273, 474, 903, 5264], '128-percentage': [0, 3.81, 7.32, 12.85, 23, 100],
            '133-value': [0, 142, 276, 487, 911, 5610], '133-percentage': [0, 3, 94, 7.34, 13.03, 23.31, 100],
            '143-value': [0, 142, 276, 483, 902, 5520], '143-percentage': [0, 3.89, 7.36, 12.87, 23.01, 100]
        }

        this.legend.domain = domains[this.filters.dataset.value + '-' + this.filters.column.value] || domains['22-value']
        this.updateLegendTitle()
    }

    updateLegendTitle() {
        this.Title = <div>
            <div>{this.source}</div>
            <div className='text-sm text-italic font-light'>{this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name}</div>
            <div className='text-sm text-italic font-light'>Column: {this.filters.column.value}</div>
            <div></div>
        </div>
    }

    init(map, falcor) {
        let states = ["36", "34", "09", "42"]
        return falcor.get(['tig', 'views', 'byLayer', 'acs_census'], ["geo", states, "geoLevels"])
            .then(res => {
                let views = get(res, ['json', 'tig', 'views', 'byLayer', 'acs_census'], [])
                this.source = get(views, [0, 'source_name'], '')
                this.filters.dataset.domain = views.map(v => ({
                    value: v.id,
                    name: v.name
                })).sort((a, b) => a.name.localeCompare(b.name))
                this.filters.dataset.value = views.find(v => v.id === parseInt(this.vid)) ? parseInt(this.vid) : views[0].id

                this.updateColumnNames()
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
        const categoryValue = this.filters.dataset.value

        if (categoryValue) {
            return falcor.get(["tig", "acs_census", "byId", categoryValue, 'data_overlay'])
                .then(response => {
                    this.data = get(response, ['json', "tig", "acs_census", "byId", categoryValue, 'data_overlay'], [])

                    this.updateLegendDomain()

                    let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value || []

                    this.data_tracts = this.data
                        .filter(c => geoids.includes(c.fips.slice(0, 5)))
                        .map(item => {
                            return tracts
                                .reduce((a, c) => {
                                    if (item.area === c.name) {
                                        a['name'] = c.name
                                        a['geoid'] = c.geoid
                                    }
                                    return a
                                }, {})
                        })


                    // this.filters.census_tract.domain = this.data_tracts.map(dt => dt.name)
                    console.log('data', response)
                    return response
                })
        }


    }

    getBounds() {
        let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value,
            filtered = this.geographies.filter(({value}) => geoids.includes(value));

        return filtered.reduce((a, c) => a.extend(c.bounding_box), new mapboxgl.LngLatBounds())
    }

    zoomToGeography(value) {
        if (!this.mapboxMap) return;

        if (value) {
            this.mapboxMap.easeTo({center: value, zoom: 12})
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

    onFilterChange(filterName, value, preValue) {
        if (!this.processedData) {
            return
        }
        switch (filterName) {
            case "dataset": {
                // this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()
                this.updateColumnNames()
                this.updateLegendTitle()
                break;
            }
            case "column": {
                // this.legend.domain = this.filters.column.value === 'percentage' ? [0, 3.53, 6.9, 12.63, 22.92, 100] : [0,129, 257, 459, 897, 4959]

                // this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()

                if (value === 'percent') {
                    this.legend.format = ',f'
                } else {
                    this.legend.format = ',d'
                }
                break;
            }

            case "geography": {
                //console.log('new geography', newValue)
                this.zoomToGeography();
                this.saveToLocalStorage();
                break;
            }

            case "census_tract": {
                let geom = JSON.parse(get(this.data.filter(d => d.area.toLowerCase() === value.toLowerCase()), [0, 'geom'], '{}'))

                if (geom && Object.keys(geom).length) {
                    let featId =
                        get(this.mapboxMap.queryRenderedFeatures()
                            .filter(feats => feats.properties.GEOID === get(this.data_tracts.filter(dc => dc.name.toLowerCase() === value.toLowerCase()), [0, 'geoid'])), [0, 'id'])

                    if(featId){
                        this.featId && this.mapboxMap.setFeatureState(
                            { source: 'nymtc_census_tracts', id: this.featId, sourceLayer: 'census_tracts'},
                            { hover: false }
                        );
                        this.mapboxMap.setFeatureState(
                            { source: 'nymtc_census_tracts', id: featId, sourceLayer: 'census_tracts'},
                            { hover: true }
                        );
                        this.featId = featId;
                    }
                    this.zoomToGeography(get(centroid(geom), ['geometry', 'coordinates']))
                }else{
                    this.featId && this.mapboxMap.setFeatureState(
                        { source: 'nymtc_census_tracts', id: this.featId, sourceLayer: 'census_tracts'},
                        { hover: false }
                    );

                    this.featId = null;
                    this.zoomToGeography();
                }
                break;
            }

            default: {
                //do nothing
            }
        }

    }

    getFormat(column) {
        return ',d' ? column === 'value' : ',f'
    }

    getColorScale(data) {
        return d3scale.scaleThreshold()
            .domain(this.legend.domain)
            .range(this.legend.range);
    }

    render(map, falcor) {
        if (!this.data || !map) {
            return this.fetchData(falcor)
        }
        if (this.data_tracts.length) {
            map.setFilter("tracts", ["in", ["get", "GEOID"], ["literal", this.data_tracts.map(d => d.geoid)]]);
            map.setFilter("tracts-line", ["in", ["get", "GEOID"], ["literal", this.data_tracts.map(d => d.geoid)]]);
        } else {
            map.setFilter("tracts", false);
            map.setFilter("tracts-line", false);
        }
        //
        this.processedData = this.data.reduce((acc, curr) => {
            this.data_tracts.forEach(data_tract => {
                if (curr.area === data_tract.name) {
                    acc.push({
                        id: data_tract.geoid,
                        value: curr[this.filters.column.value]
                    })
                }
            })
            return acc
        }, [])

        const colorScale = this.getColorScale(this.processedData),
            colors = this.processedData.filter(c => c.value).reduce((a, c) => {
                a[c.id] = colorScale(c.value)
                return a
            }, {});

        map.setPaintProperty("tracts", "fill-color", [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#090",
            ["get", ["get", "GEOID"], ["literal", colors]]
        ])

        this.map = map
    }

}

export const ACSCensusLayerFactory = (options = {}) => new ACSCensusLayer(options);
