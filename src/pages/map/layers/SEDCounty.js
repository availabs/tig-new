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
import {download as shpDownload} from "../../../utils/shp-write";


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
        show: false,
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
                            <label className={'self-center mr-1 text-sm font-light'} htmlFor={'search'}>County Search:</label>

                            <input
                                className={'p-1 w-full border'}
                                id={'search'}
                                type={'text'}
                                name={'search'}
                                onChange={e => {
                                    let v = e.target.value
                                    if (!e.target.value.length) {
                                        v = 'Select All'
                                    }
                                    layer.onFilterChange('county', v)
                                    layer.dispatchUpdate(layer, {county: v})
                                }}
                                placeholder={'ex: Queens'}/>
                        </div>
                    </div>
                )
            },
            width: 450
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
                    <div className="relative  p-4">
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
                    </div>
                )
            },
            width: 450
        }
    ]

    download(setLoading){
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

        this.updateLegendTitle()
    }

    updateLegendTitle() {
        this.Title = <div>
                <div>{this.source}</div>
                <div className='text-sm text-italic font-light'>{this.filters.dataset.domain.filter(d => d.value === this.filters.dataset.value)[0].name}</div>
                <div className='text-sm text-italic font-light'>Year: {this.filters.year.value}</div>
        </div>

        // `
        // ,
        // , 
        //                         `
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
                this.filters.dataset.value = views.find(v => v.id === parseInt(this.vid)) ? parseInt(this.vid) : views[0].id
                console.log('hello', this.source, views, this.filters.dataset.value, parseInt(this.vid))

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

        return falcor.get(["tig", this.type.includes('2055') ? "sed_county" : "sed_county", "byId", view, 'data_overlay'])
            .then(response =>{
                this.data = get(response, ["json", "tig", this.type.includes('2055') ? "sed_county" : "sed_county", "byId", view, 'data_overlay'], [])

                if(!this.filters.year.domain.length){
                    this.filters.year.domain = _.uniq(this.data.reduce((acc, curr) => [...acc, ...Object.keys(curr.data)], []));
                    this.filters.year.value = this.filters.year.domain[0];
                    console.log('l?', this)
                }

                this.updateLegendDomain()

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
                this.filters.year.domain = _.uniq(this.data.reduce((acc, curr) => [...acc, ...Object.keys(curr.data)], []));
                this.filters.year.value = value;

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
                let geom = JSON.parse(get(this.data.filter(d => d.area.toLowerCase() === value.toLowerCase()), [0, 'geom'], '{}'))
                if (geom && Object.keys(geom).length) {
                    let featId =
                        get(this.mapboxMap.queryRenderedFeatures()
                            .filter(feats => feats.properties.geoid === get(this.data_counties.filter(dc => dc.name.toLowerCase() === value.toLowerCase()), [0, 'geoid'])), [0, 'id'])
                   if(featId){
                       this.mapboxMap.setFeatureState(
                           { source: 'counties', id: featId, sourceLayer: 'counties'},
                           { hover: true }
                       );
                       this.featId = featId;
                   }
                    this.zoomToGeography(get(centroid(geom), ['geometry', 'coordinates']))
                }else{
                    this.mapboxMap.setFeatureState(
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
                        value: curr.data[this.filters.year.value]
                    })
                }
            })
            return acc
        },[])


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
