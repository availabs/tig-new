import {LayerContainer} from "components/avl-map/src"
import tracts from '../config/tracts.json'
import {getColorRange} from "components/avl-components/src"
import get from "lodash.get"
import _ from 'lodash'
import * as d3scale from "d3-scale"
import {filters} from 'pages/map/layers/npmrds/filters.js'
import mapboxgl from "mapbox-gl";
import flatten from "lodash.flatten";
import centroid from "@turf/centroid";
import {download as shpDownload} from "utils/shp-write";
import TypeAhead from "components/tig/TypeAhead";
import {ckmeans} from "simple-statistics";

class ACSCensusLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.categoryName = props.name
        this.viewid = props.viewId
        this.vid = props.vid
    }

    attribution = <div className={'text-sm grid grid-col-1 gap-4'}>
        <p id="attribution-41">Census tract map data © <a href="http://nymtc.org/">NY Metropolitan Transportation
            Council</a></p>
    </div>
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
        column: {
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
        layers: ["tracts", 'nymtc_source_boundaries'],
        callback: (layerId, features, lngLat) => {
            const geoid = features.reduce((a, c) => {
                a = get(c, ['properties', 'area'], '')
                return a
            }, '')

            const graph = tracts.reduce((a, c) => {
                if (c.name === geoid) {
                    a = c
                }
                return a
            }, {})

            const col = this.filters.column.domain.filter(d => d.value === this.filters.column.value)[0].name
            return this.data.reduce((a, c) => {
                if (c.area === graph['name']) {
                    a.push(
                        ['Tract', `${c.area}-${graph['state_code']}`],
                        [col, this.filters.column.value === 'percentage' ? c[this.filters.column.value].toFixed(2) + '%' : c[this.filters.column.value].toLocaleString()]
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
        },
        {
            id: "source_boundaries",
            source: {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [],
                },
            }
        }
    ]

    layers = [
        {
            id: "nymtc_source_boundaries",
            // filter: false,
            source: "source_boundaries",
            type: "fill",
            paint: {
                // "fill-color": "#f00"
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
            // filter: false,
            source: "source_boundaries",
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
                    <div>
                        <div className="relative border-top">
                            <div className={'p-1 w-full'}>
                                {layer.Title}
                            </div>
                        </div>
                        <label className={'self-center mr-1 text-sm font-light'} htmlFor={'search'}>Tract
                            Search:</label>
                            <TypeAhead
                                className={''}
                                classNameMenu={'border-b hover:bg-blue-300'}
                                suggestions={layer.data.map(t => t.area)}
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
                )
            },
            width: 250
        }
    ]

    download(setLoading) {
        const filename = this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name +
            (this.filters.geography.value === 'All' ? '' : ` ${this.filters.geography.value}`);

        let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value || [];

        let geoJSON = {
            type: 'FeatureCollection',
            features: []
        };

        this.data
            .filter(c => geoids.includes(
                get(tracts.filter(tract => tract.name === c.area), [0, 'geoid'], '').slice(0, 5)
            ) && c.geom)
            .map((d, i) => {
                return {
                    type: "Feature",
                    id: i,
                    properties: {
                        area: d.area,
                        type: d.type,
                        // geoid: d.fips,
                        value: d.value,
                        percentage: d.percentage,
                    },
                    geometry: JSON.parse(d.geom)
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
        // console.log('counts', _.uniq(geoJSON.features.map(f => f.geometry.type)), geoJSON.features.filter(f => f.geometry.type === 'Polygon').length, geoJSON.features.filter(f => f.geometry.type === 'MultiPolygon').length)


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
        let values = _.uniq((this.data || []).map(d => get(d, [this.filters.column.value], 0))).filter(v => v)

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
            this.legend.domain = [0, 300, 756, 1432, 2553, 21552]
        }

        this.updateLegendTitle()
    }

    updateLegendTitle() {
        this.Title = <div>
            <div>{this.source}</div>
            <div
                className='text-sm text-italic font-light'>{this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name}</div>
            <div className='text-sm text-italic font-light'>Column: {
                get(this.filters.column.domain.filter(c => c.value === this.filters.column.value), [0, 'name'], '')
            }</div>
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
                this.filters.dataset.value = views.find(v => v.id === parseInt(this.vid)) ? parseInt(this.vid) : get(views, [0, 'id'])

                this.updateColumnNames()
                this.updateLegendTitle()
                // this.updateLegendDomain()

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

                //this.zoomToGeography();
            })
    }

    fetchData(falcor) {
        const categoryValue = this.filters.dataset.value
        let view = this.filters.dataset.value || this.vid
        if (view) {
            return falcor.get(
                // ["tig", "acs_census", "byId", categoryValue, 'data_overlay'],
                ['tig', 'source', 'acs_census', 'view', view])
                .then(async (d) => {
                    let falcorCache = falcor.getCache()
                    // this.data = get(falcorCache, ["tig", "acs_census", "byId", categoryValue, 'data_overlay', 'value'], [])
                    this.data = Object.values(get(falcorCache , ['tig', 'source', 'acs_census', 'view', view, 'value'], {}));

                    await _.chunk(this.data.map(d => d.gid), 450)
                        .reduce((acc, curr) => acc.then(() => falcor.get(['tig', 'geoms', 'gid', curr])) , Promise.resolve())

                    this.geoms = get(falcor.getCache(), ['tig', 'geoms', 'gid'], [])

                    this.data = this.data.map(d => ({...d, geom: this.geoms[d.gid] }))
                })
        }
        return Promise.resolve({})



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

        this.defaultZoom = options;

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
                this.updateLegendDomain()
                break;
            }
            case "column": {
                // this.legend.domain = this.filters.column.value === 'percentage' ? [0, 3.53, 6.9, 12.63, 22.92, 100] : [0,129, 257, 459, 897, 4959]

                // this.legend.domain = this.processedData.map(d => d.value).filter(d => d).sort()

                this.updateLegendDomain()
                this.updateLegendTitle()
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
                    let featId;
                    if(this.featMapping){
                        featId = this.featMapping.get(value)
                    }else{
                        this.featMapping = new Map();
                        this.mapboxMap.queryRenderedFeatures()
                            .filter(feats => feats.properties.area)
                            .map(feats => this.featMapping.set(feats.properties.area, feats.id.toString()))

                        featId = this.featMapping.get(value)
                    }

                    if(featId){
                        this.featId && this.mapboxMap.setFeatureState(
                            { source: 'source_boundaries', id: this.featId,
                                // sourceLayer: 'census_tracts'
                            },
                            { hover: false }
                        );
                        this.mapboxMap.setFeatureState(
                            { source: 'source_boundaries', id: featId,
                                // sourceLayer: 'census_tracts'
                            },
                            { hover: true }
                        );
                        this.featId = featId;
                    }
                    this.zoomToGeography(get(centroid(geom), ['geometry', 'coordinates']))
                } else {
                    this.featId && this.mapboxMap.setFeatureState(
                        {source: 'source_boundaries', id: this.featId,
                            // sourceLayer: 'census_tracts'
                        },
                        {hover: false}
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

    async render(map, falcor) {
        if(!this.data){
            await this.fetchData(falcor)
        }

        this.updateLegendDomain();

        let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value || []
        if (this.data.length === 0 || !map) {
            return this.fetchData(falcor)
        }

        let features = this.data
            .filter(c => geoids.includes(
                get(tracts.filter(tract => tract.name === c.area), [0, 'geoid'], '').slice(0, 5)
            ) && c.geom)
            .map((d, i) => {
                return {
                    type: "Feature",
                    id: i,
                    properties: {
                        area: d.area,
                        // geoid: d.fips
                    },
                    geometry: JSON.parse(d.geom)
                }
            })

        map.getSource("source_boundaries").setData({
            type: "FeatureCollection",
            features
        });

        this.processedData = this.data.map((d) => {
            return {
                id: d.area,
                value: d[this.filters.column.value]
            }
        })
        let colors = this.processedData.reduce((a, c) => {
                a[c.id] = this.getColorScale(c.value)
                return a
            }, {});

        map.setPaintProperty("nymtc_source_boundaries", "fill-color", [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#090",
            ['coalesce', ["get", ["get", "area"], ["literal", colors]], this.getColorScale(1)]
        ])
    }

}

export const ACSCensusLayerFactory = (options = {}) => new ACSCensusLayer(options);