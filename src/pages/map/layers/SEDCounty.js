import {LayerContainer} from "components/avl-map/src"
import counties from '../config/counties.json'
import { getColorRange} from "@availabs/avl-components"
import * as d3scale from "d3-scale"
import get from "lodash.get"
import _ from 'lodash'
import {filters} from 'pages/map/layers/npmrds/filters.js'
import flatten from "lodash.flatten";
import mapboxgl from "mapbox-gl";
import centroid from "@turf/centroid";
import center from "@turf/center";
import {download as shpDownload} from "utils/shp-write";
import TypeAhead from "components/tig/TypeAhead";
import {ckmeans} from "simple-statistics";
class SED2040CountyLevelForecastLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId
        this.vid = props.vid
        this.type = props.type

        this.name = `${props.type.split('_')[2]} SED County Level Forecast`
    }

    attribution = <div className={'text-sm grid grid-col-1 gap-4'}>
        <p id="attribution-TzOHvL">Urban Area Boundary map data © <a href="http://nymtc.org/">NY Metropolitan Transportation Council</a></p>
        <p id="attribution-42">County map data © <a href="http://census.gov/">US Census Bureau</a></p>
    </div>
    data_counties = []
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
        type: "quantile",
        range: getColorRange(5, "YlOrRd", true),
        domain: [],
        show: false,
        units: ' (in 000s)',
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
                                a = c.name + ' (in 000s)'
                            }
                            return a
                        },'')],
                        ["Year:", this.filters.year.value],
                        ['County:',`${c.area}-${graph['state_code']}`],
                        ["Value:",c.value.toLocaleString()]
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
        },
        {
            id: "county-labels",
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
                ],
            }
        },
        {
            id: "Counties-line",
            filter: false,
            "source-layer": "counties",
            source: "counties",
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

        { id: 'counties-labels',
            source: 'county-labels',
            type: 'symbol',
            'layout': {
                'text-field': ['get', 'area'],
                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                'text-radial-offset': 0.5,
                'text-justify': 'auto',
                'icon-image': ['get', 'icon']
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
            width: 250
        },
        {
            Component: ({layer}) => {

                return (
                    <div className="relative border-top">
                        <div className={''}>
                            <label className={'self-center mr-1 text-sm font-light'} htmlFor={'search'}>County Search:</label>

                            <div>
                               <TypeAhead
                                   className={'p-1 w-full border'}
                                   classNameMenu={'border-b hover:bg-blue-300'}
                                   suggestions={layer.data_counties.map(c => c.name)}
                                   setParentState={e => {
                                       if (!e.length) {
                                           e = 'Select All'
                                       }
                                       layer.onFilterChange('county', e)
                                       layer.dispatchUpdate(layer, {county: e})
                                   }}
                                   placeholder={'ex: Queens'}
                               />
                            </div>
                        </div>
                    </div>
                )
            },
            width: 250
        },

        {
            Component: ({layer}) => {
                const setBubble = (range, bubble) => {
                    const val = range.value;
                    const min = range.min ? range.min : 0;
                    const max = range.max ? range.max : 100;
                    const newVal = Number(((val - min) * 100) / (max - min));
                    bubble.innerHTML = layer.filters.year.domain[val];

                    // Sorta magic numbers based on size of the native UI thumb
                    bubble.style.left = `calc(${newVal}% + (${50 - newVal}px))`;
                }

                let range = document.getElementById(`yearRange-${layer.id}`),
                    bubble = document.getElementById(`yearRangeBubble-${layer.id}`);

                if(range){
                    range.addEventListener("input", () => {
                        setBubble(range, bubble);
                    });
                    setBubble(range, bubble);
                }
                return (
                    <div className="relative  p-1">
                        <label htmlFor={`yearRange-${layer.id}`} className="form-label text-sm font-light">Year</label>
                        <output id={`yearRangeBubble-${layer.id}`} className="bubble text-sm" style={{
                            padding: '1px 14px',
                            marginTop: '1.95rem',
                            position: 'absolute',
                            borderRadius: '2px',
                            left: '50%',
                            transform: 'translateX(-50%)'}}></output>

                        <div className={'flex mt-10'}>
                            <div>{layer.filters.year.domain[0]}</div>
                            <input
                                type="range"
                                className="
                                      z-50
                                      form-range
                                      appearance-none
                                      w-full
                                      h-6
                                      p-0
                                      bg-transparent
                                      focus:outline-none focus:ring-0 focus:shadow-none
                                    "
                                min={0}
                                max={layer.filters.year.domain.length - 1}
                                step={1}
                                defaultValue={0}
                                id={`yearRange-${layer.id}`}
                                name={`yearRange-${layer.id}`}
                                onChange={e => {
                                    layer.filters.year.onChange()
                                    layer.onFilterChange('year', layer.filters.year.domain[e.target.value])
                                    layer.dispatchUpdate(layer, {year: layer.filters.year.domain[e.target.value]})
                                }}
                            />
                            <div>{layer.filters.year.domain[layer.filters.year.domain.length - 1]}</div>
                        </div>

                        <div className={'flex justify-between rounded-lg z-10'}
                             style={{
                                 padding: '1px 2px',
                                 marginTop: '-1.3499rem',
                                 position: 'absolute',
                                 borderRadius: '2px',
                                 left: '50%',
                                 width: '70%',
                                 transform: 'translateX(-50%)',
                                 backgroundColor: 'rgba(82,78,78,0.4)'
                             }}
                        >
                            {
                                _.range(Math.ceil(layer.filters.year.domain.length / 3))
                                    .map(i => <span id={i} className={'fa fa-caret-up'} />)
                            }
                        </div>

                    </div>
                )
            },
            width: 250
        }
    ]

    download(setLoading){
        const filename = this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name +
            (this.filters.geography.value === 'All' ? '' : ` ${this.filters.geography.value}`);

        let d = this.data.reduce((acc,curr) =>{
            this.data_counties.forEach(data_tract =>{
                let values = Object.keys(this.fullData).reduce((acc, year) => {
                    acc[year] = get(this.fullData[year].filter(data => data.area === data_tract.name), [0, 'value']);
                    return acc;
                } , {})
                if(curr.area === data_tract.name){
                    acc.push({
                        geoid: data_tract.geoid,
                        ...values,
                        geom: JSON.parse(this.geoms[curr.gid]),
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
                    type: "Feature",
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

    updateLegendDomain() {
    let values = _.uniq((this.data || []).map(d => get(d, ['value'], 0)))

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
            this.mapboxMap.easeTo({center: value, zoom: 9})
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

        return falcor.get(
            ["tig", this.type.includes('2055') ? "sed_county" : "sed_county", "byId", view, 'data_overlay'],
            ['tig', 'source', `${this.type.split('_')[2]} SED County Level Forecast`, 'view', view]
        )
            .then(async (response) =>{
                let newData =  get(response, ['json', 'tig', 'source', `${this.type.split('_')[2]} SED County Level Forecast`, 'view', view], {});

                if(!this.filters.year.domain.length){
                    this.filters.year.domain = Object.keys(newData);
                    this.filters.year.value = this.filters.year.domain[0];
                }

                this.fullData = newData || {};
                this.data = newData[this.filters.year.value] || []

                this.updateLegendDomain()

                console.time('getting geoms')
                let geoms = await falcor.get(['tig', 'geoms', 'gid', this.data.map(d => d.gid)])
                this.geoms = get(geoms, ['json', 'tig', 'geoms', 'gid'], [])
                console.timeEnd('getting geoms')

                let geoids = this.filters.geography.domain.filter(d => d.name === this.filters.geography.value)[0].value || []

                this.data_counties = this.data
                    .filter(item => geoids.includes(get(counties.filter(c => c.name === item.area), [0], {}).geoid))
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

                this.filters.year.value = value;
                this.data = this.fullData[this.filters.year.value] || []

                if(value && document.getElementById(`yearRange-${this.id}`) && document.getElementById(`yearRange-${this.id}`).value.toString() !== this.filters.year.domain.indexOf(value).toString()){
                    document.getElementById(`yearRange-${this.id}`).value = this.filters.year.domain.indexOf(value).toString()
                }
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
            case "county": {
                let geom = JSON.parse(
                    this.geoms[get(this.data.filter(d => d.area.toLowerCase() === value.toLowerCase()), [0, 'gid'])] || '{}'
                )

                if (geom && Object.keys(geom).length) {
                    let featId;
                    if(this.featMapping){
                        featId = this.featMapping.get(value)
                    }else{
                        this.featMapping = new Map();
                        this.mapboxMap.queryRenderedFeatures({layers: ['Counties']})
                            .filter(feats => feats.properties.geoid)
                            .map(feats => this.featMapping.set(this.geoidToNameMapping[feats.properties.geoid], feats.id))

                        featId = this.featMapping.get(value)
                    }

                   if(featId){
                       this.featId &&  this.mapboxMap.setFeatureState(
                           { source: 'counties', id: this.featId, sourceLayer: 'counties'},
                           { hover: false }
                       );

                       this.mapboxMap.setFeatureState(
                           { source: 'counties', id: featId, sourceLayer: 'counties'},
                           { hover: true }
                       );
                       this.featId = featId;
                   }
                    this.zoomToGeography(get(centroid(geom), ['geometry', 'coordinates']))
                }else{
                    this.featId && this.mapboxMap.setFeatureState(
                        { source: 'counties', id: this.featId, sourceLayer: 'counties'},
                        { hover: false }
                    );

                    this.featId = null;
                    this.zoomToGeography();
                }
                break;
            }
            default:{
                //do nothing
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

    render(map, falcor) {
        if (!this.data){
            return this.fetchData(falcor).then(() => this.data && this.render(map, falcor))
        }
        if (this.data_counties && this.data_counties.length) {
            map.setFilter("Counties", ["in", ["get", "geoid"], ["literal", this.data_counties.map(d => d.geoid)]]);
            map.setFilter("Counties-line", ["in", ["get", "geoid"], ["literal", this.data_counties.map(d => d.geoid)]]);
        }
        else {
            map.setFilter("Counties", false);
            map.setFilter("Counties-line", false);
        }

        this.processedData = this.data.reduce((acc,curr) =>{
            this.data_counties.forEach(data_county =>{
                if(curr.area === data_county.name){
                    acc.push({
                        id: data_county.geoid,
                        value: curr.value
                    })
                }
            })
            return acc
        },[])

        const colors = this.processedData.reduce((a,c) =>{
                if(c.value !== 0){
                    a[c.id] = this.getColorScale(c.value)
                }
                return a
            },{});


        map.setPaintProperty("Counties", "fill-color", [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#090",
            ["get", ["get", "geoid"], ["literal", colors]]
        ])


        // get polygons, and label them
        let geoJSON = {
            type: 'FeatureCollection',
            features: []
        };
        this.geoidToNameMapping = {}
        this.data.reduce((acc,curr) =>{
            this.data_counties.forEach(data_tract =>{
                if(curr.area === data_tract.name){
                    this.geoidToNameMapping[data_tract.geoid] = curr.area;
                    acc.push({
                        geoid: data_tract.geoid,
                        geom: JSON.parse(this.geoms[curr.gid]),
                        area: curr.area,
                        area_type: curr.type
                    })
                }
            })
            return acc
        },[]).map(t => {
                return {
                    type: "Feature",
                    properties: Object.keys(t).filter(t => t !== 'geom').reduce((acc, curr) => ({...acc, [curr]: t[curr]}) , {}),
                    geometry: t.geom
                }
            })
            .forEach((feat) => {
                let geom = center(feat.geometry);
                geom.properties = {...feat.properties}
                geoJSON.features.push(geom)
            });

        map.getSource('county-labels').setData(geoJSON)
    }


}

export const SEDCountyLayerFactory = (options = {}) => new SED2040CountyLevelForecastLayer(options);
