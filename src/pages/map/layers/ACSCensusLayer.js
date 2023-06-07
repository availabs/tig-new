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
import counties from "../config/counties"
import {sources, layers, CENSUS_FILTER_CONFIG, HOVER_COLOR } from '../config/acsConfig'

const YEARS = [2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014];


class ACSCensusLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.categoryName = props.name
        this.viewid = props.viewId
        this.vid = props.vid
        this.data=[]
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
        year: {
            name: 'Year',
            type: 'dropdown',
            value: 2019,
            domain: YEARS
        },
        census: {
            name: 'Dataset',
            type: 'dropdown',
            domain: CENSUS_FILTER_CONFIG,
            value: CENSUS_FILTER_CONFIG[2].name,
            multi: false,
            accessor: d => d.name,
            valueAccessor: d => d.name,
        }
    }
    legend = {
        type: "quantile",
        range: getColorRange(5, "YlOrRd", false),
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

            return []

        }
    }

    sources = sources

    layers = layers

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

    getGeoids() {
        
        const geolevel = 'tracts';
        const year = this.filters.year.value;
        const geoValue = this.filters.geography.value
        const baseGeoids = this.filters.geography.domain
                .reduce((a, c) => c.name === geoValue ? c.value : a, [])
        
        const cache = this.falcor.getCache()
        const subGeoids = baseGeoids.reduce((a, c) => {
          a.push(...get(cache, ["geo", c, year, geolevel, "value"], []))
          return a;
        }, []);
        return subGeoids
    }

    

    init(map, falcor) {
        let states = ["36", "34", "09", "42"]
        return falcor.get(["geo", states, "geoLevels"])
            .then(res => {
                let geo = get(res, 'json.geo', {})
                const geographies = flatten(states.map(s => geo[s].geoLevels));

                this.geographies =
                    geographies.map(geo => ({
                        name: `${geo.geoname.toUpperCase()} ${geo.geolevel}`,
                        geolevel: geo.geolevel,
                        value: geo.geoid,
                        bounding_box: geo.bounding_box
                    }));

                
            })
    }

    fetchData(falcor) {
        console.log('fetchData', this.filters)
        const geolevel = 'tracts',
              year = this.filters.year.value,
              filter = this.filters.census,
              value = filter.value,
              census = [
                ...filter.domain.reduce((a, c) => c.name === value ? c.censusKeys : a, []),
                ...filter.domain.reduce((a, c) => c.name === value ? c.divisorKeys : a, [])
              ];

            const geoValue = this.filters.geography.value
            const geoids = this.filters.geography.domain
                .reduce((a, c) => c.name === geoValue ? c.value : a, [])
            // falcorGraph.get(["geo", geoids.slice(0, 10), year, geolevel])
            //   .then(res => console.log("RES:", res));

            return falcor.chunk(
              ["geo", geoids, year, geolevel]
            )
            .then(() => {
              const cache = falcor.getCache(),
                subGeoids = geoids.reduce((a, c) => {
                  a.push(...get(cache, ["geo", c, year, geolevel, "value"], []))
                  return a;
                }, []);

              return falcor.chunk(
                ["acs", subGeoids, year, census]
              )
            })

    }

    async render(map, falcor) {
        await this.fetchData(falcor)
        const cache = falcor.getCache()
        console.log('whola cache', cache)
        const geoids = this.getGeoids()
        const year = this.filters.year.value
        const layer_year = year < 2020 ? 2017 : 2020
        const geolevelValue = 'tracts'
        const geolevel = `${ geolevelValue }-${ layer_year }`
        const censusValue = this.filters.census.value
        const censusKeys = this.filters.census.domain
            .reduce((a, c) => c.name === censusValue ? c.censusKeys : a, [])
        const divisorKeys = this.filters.census.domain.reduce((a, c) => c.name === censusValue ? c.divisorKeys : a, [])

        console.log('censusKeys', censusKeys, this.filters.census.domain)
        const valueMap = geoids.reduce((a, c) => {

          let value = censusKeys.reduce((aa, cc) => {
            const v = get(cache, ["acs", c, year, cc], -666666666);
            console.log('v', v,  ["acs", c, year, cc])
            if (v !== -666666666) {
              aa += v;
            }
            return aa;
          }, 0);
          const divisor = divisorKeys.reduce((aa, cc) => {
            const v = get(cache, ["acs", c, year, cc], -666666666);
            if (v != -666666666) {
              aa += v;
            }
            return aa;
          }, 0)
          if (divisor !== 0) {
            value /= divisor;
          }
          a[c] = value;
          return a;
        }, {})
        const values = Object.values(valueMap);
        console.log('hola', values)

        this.updateLegendDomain(values)
        const colors = {};
        geoids.forEach(geoid => {
            colors[geoid] = this.colorScale(valueMap[geoid])
        })

          //this.geoData = { ...this.geoData, ...valueMap };

          // const oldGeolevel = get(prevMeta, "geolevel", false);
          // if (oldGeolevel && (oldGeolevel !== geolevel)) {
          //   map.setFilter(oldGeolevel, ["in", "none", "none"]);
          // }
        map.setFilter(geolevel, ["in", "geoid", ...geoids]);
          
        map.setPaintProperty(geolevel, "fill-color",
            ["case",
                ["boolean", ["feature-state", "hover"], false], HOVER_COLOR,
                ["match", ["to-string", ["get", "geoid"]], Object.keys(colors),
                ["get", ["to-string", ["get", "geoid"]], ["literal", colors]],"#000"]
            ]
        )

         map.setPaintProperty(geolevel, "fill-opacity", 0.7)
          
        
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
      return    
    }

    getFormat(column) {
        return ',d' ? column === 'value' : ',f'
    }

    updateLegendDomain(values) {
        // let values = _.uniq((data || []).map(d => get(d, ['value'], 0)))
        this.legend.range = this.filters.census.domain
            .reduce((a, c) => c.name === this.filters.census.value ? c.range : a, getColorRange(5, 'YlGn', false))
        
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
        //this.updateLegendTitle()
    }

    colorScale(value) {
        if(!this.legend.domain.length) return 'rgba(0,0,0,0)';
        let color = 'rgba(0,0,0,0)'
        
        this.legend.domain.forEach((v, i) => {
                if(value >= v && value <= this.legend.domain[i+1]){
                    color = this.legend.range[i];
                }
            });
        return color;
    }


}

export const ACSCensusLayerFactory = (options = {}) => new ACSCensusLayer(options);
