import {LayerContainer} from "components/avl-map/src"
import get from "lodash.get"
import hub_bound from '../config/hub_bound.json'
import mapboxgl from 'mapbox-gl'
import shpwrite from "../../../utils/shp-write";
// import flatten from "lodash.flatten";
import _ from 'lodash'

const color_scheme = [
    {
        "color": "rgb(0, 0, 0)",
        "value": "Boundary Line",
        "label": "Boundary Line"
    },
    {
        "color": "rgb(0, 255, 255)",
        "value": "60th Street Sector",
        "label": "60th Street Sector"
    },
    {
        "color": "rgb(0, 255, 0)",
        "value": "Brooklyn",
        "label": "Brooklyn"
    },
    {
        "color": "rgb(255, 0, 0)",
        "value": "New Jersey",
        "label": "New Jersey"
    },
    {
        "color": "rgb(0, 0, 255)",
        "value": "Queens",
        "label": "Queens"
    },
    {
        "color": "rgb(255, 0, 255)",
        "value": "Staten Island",
        "label": "Staten Island"
    }
]

class HubBoundTravelDataLayer extends LayerContainer {
    constructor(props) {
        super(props);
        this.viewId = props.viewId

        this.vid = props.vid
        this.type = props.type

        console.log('hello props', props)
    }
    attribution = <div className={'text-sm grid grid-col-1 gap-4'}>
        <p id="attribution-MQ66mo">Hub Bound Travel Data - 2007-2019 data © <a href="http://nymtc.org/">NY Metropolitan Transportation Council</a></p>
        <p id="attribution-63">Hub Boundary map data © <a href="http://nymtc.org/">NY Metropolitan Transportation Council</a></p>
    </div>
    setActive = !!this.viewId
    name = 'Hub Bound Travel Data'
    filters = {
        year: {
            name: 'Year',
            type: 'dropdown',
            domain: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,2020],
            value: 2020,
            multi: false
        },
        from: {
            name: 'From',
            type: 'dropdown',
            domain: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'],
            value: '12AM',
            multi: false
        },
        to: {
            name: 'To',
            type: 'dropdown',
            domain: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'],
            value: '12PM',
            multi: false
        },
        mode_name: {
            name: 'Mode',
            type: 'dropdown',
            domain: [
                "Bicycle",
                "Express Bus",
                "Local Bus",
                "Private Ferry",
                "Public Ferry",
                "Rail Rapid Transit - Express",
                "Rail Rapid Transit - Local",
                "Suburban Rail",
                "Tramway",
                "Vehicles (Auto+Taxi+Trucks+Comm. Vans)"
            ],
            value: "Vehicles (Auto+Taxi+Trucks+Comm. Vans)",
            multi: false
        },
        direction: {
            name: 'Direction',
            type: 'dropdown',
            domain: ['Inbound', 'Outbound'],
            value: 'Inbound',
            multi: false
        }
    }
    onHover = {
        layers: ["county_points"],
        callback: (layerId, features, lngLat) => {
            const ids = _.uniq(features.map(c => get(c, ['id'], '')))

        let data = this.data


            let c = ids.reduce((acc, id) => {
                    let tmpData = data.filter(d => d.id === id)[0]
                    acc = {
                        'Facility Name:': tmpData['loc_name'],
                        'Sector:': tmpData['sector_name'],
                        'Mode:': tmpData['mode_name'],
                        'Route:': tmpData['route_name'],
                        ...acc,
                        [tmpData.var_name]: tmpData.var_name === 'Occupancy Rates' ? tmpData.count : get(acc, [tmpData.var_name], 0) + parseInt(tmpData.count),
                    }

                    return acc
                },
                {
                    'Occupancy Rates': 0,
                    'Passengers': 0,
                    'Vehicles': 0,
                })

            return Object.keys(c).map((curr) => ([curr, typeof c[curr] === 'number' ? c[curr].toLocaleString() : c[curr]]))
        }
    }
    legend = {
        type: "ordinal",
        pair: 'simple',
        domain: color_scheme.map(c => c.label),
        range: color_scheme.map(c => c.color),
        height: 5,
        width: 320,
        direction: "vertical",
        show: false,
        Title: ""
    }
    sources = [
        {
            id: "county_points",
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                },

            }
        },
        {
            id: "county",
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                },

            }
        }
    ]
    layers = [
        {
            id: "county_points",
            source: 'county_points',
            type: 'circle',
            paint: {
                'circle-opacity': 1
            },
            visibility: 'none',
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
    ]
    download(setLoading) {
        const filename = `hub_bound_travel_data__${this.filters.year.domain[0]}_${this.filters.year.domain[this.filters.year.domain.length - 1]}_year${this.filters.year.value}_hour${this.filters.from.value}_${this.filters.to.value}_${this.filters.mode_name.value}_${this.filters.direction.value}`

        let data = this.data
            .filter(d =>
                Object.keys(this.filters)
                    .filter(f => !['geography'].includes(f))
                    .reduce((acc, curr) => {
                        return acc && (
                            curr === 'from' ? d.hour >= this.convertTime(this.filters[curr].value) :
                                curr === 'to' ? d.hour <= this.convertTime(this.filters[curr].value) :
                                    this.filters[curr].value.toString() === d[curr].toString())
                    }, true)
            )

        let geoJSON = {
            type: 'FeatureCollection',
            features: data.map(item => {
                return {
                    type: "Feature",
                    id: item['id'],
                    properties: {
                        ...item
                    },
                    geometry: {
                        type: "Point",
                        "coordinates": [item["lon"], item["lat"]]
                    }
                }
            })
        };

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

   

    init(map, falcor) {
        falcor.get(['tig', 'views', 'byLayer', "hub_bound_travel_data"])
        .then(res => {
            this.source = get(res, ['json', 'tig', 'views', 'byLayer', this.type, 0, 'source_name'], '')
        })
        console.log('hello init',this)

        if(this.setActive) {
            let coordinates = hub_bound.features[0].geometry.coordinates[0];
            let bounds = coordinates.reduce(function (bounds, coord) {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
            map.fitBounds(bounds)
        }


    }

    fetchData(falcor) {
       // this.mapboxMap.fit
        let view = this.vid || 23
        return falcor.get(["tig", "hub_bound_travel_data", "byId", view, 'data_overlay'])
        
    }

    updateLegendTitle() {
        this.Title = <div>
            <div>{this.source}</div>
            <div className='text-sm text-italic font-light'>Mode: {this.filters.mode_name.value}</div>
            <div className='text-sm text-italic font-light'>Year: {this.filters.year.value}</div>
            <div className='text-sm text-italic font-light'>From: {this.filters.from.value} To: {this.filters.to.value}</div>
            <div className='text-sm text-italic font-light'>Direction: {this.filters.direction.value}</div>
        </div>
    }

    onFilterChange(filterName, value, preValue) {
        this.updateLegendTitle()
    }

    convertTime(time) {
        let value = 0
        if (time.includes('AM') && time !== '12AM') {
            value = time.substring(0, time.length - 2)
        } else if (time.includes('PM') && time !== '12PM') {
            value = 12 + parseInt(time.substring(0, time.length - 2))
        } else if (time === '12AM') {
            value = 0
        } else {
            value = 23
        }
        return value
    }

    render(map, falcor) {
        let falcorCache = falcor.getCache()
       

        let view = this.vid || 23
        let data =  get(falcorCache, [ "tig", 'hub_bound_travel_data', "byId", view, 'data_overlay', 'value'], []);
        this.updateLegendTitle()

        //map.setZoom(12)
        
                
        const colors = {}
        console.log(
                'from', this.convertTime(this.filters['from'].value),
                'to', this.convertTime(this.filters['to'].value),
                'hour', data[0].hour
        )
        let output = data
            .filter(d => d)
            .filter(d => (
                    d.hour >=  this.convertTime(this.filters['from'].value) &&
                    d.hour <= this.convertTime(this.filters['to'].value) && 
                    d.year === this.filters.year.value && 
                    d.direction == this.filters.direction.value && 
                    d.mode_name == this.filters.mode_name.value
                )
            )

        let modes = data.reduce((out,curr) => {
            if(!out.includes(curr.mode_name)){
                out.push(curr.mode_name)
            }
            return out
        },[])
       

        output
            .forEach(d => {
                color_scheme.forEach(item => {
                    if (item.value === d['sector_name']) {
                        colors[d['sector_name']] = item.color
                    }
                })
            })

        this.data = output

        let geojson = {
            type: "FeatureCollection",
            features: output
                .map(item => {

                    return {
                        type: "Feature",
                        id: item['id'],
                        properties: {
                            "name": item['loc_name'],
                            "sector": item['sector_name'],

                        },
                        geometry: {
                            type: "Point",
                            "coordinates": [item["lon"], item["lat"]]
                        }
                    }
                })
        }

        if (map.getSource('county_points')) {
            map.getSource('county_points').setData(geojson)
        }

        if (map.getSource('county_points') && map.getLayer("county_points")) {
            map.setPaintProperty(
                'county_points',
                'circle-color',
                ["get", ["to-string", ["get", "sector"]], ["literal", colors]]
            )
        }

        if (!map.getSource('counties') && !map.getLayer('counties')) {
            map.addSource('counties', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: hub_bound.features[0].geometry.coordinates[0]
                    }
                }
            })
            map.addLayer({
                id: "counties",
                source: 'counties',
                type: 'line',
                paint: {
                    'line-color': 'black',
                    'line-width': 1,
                    'line-dasharray': [10, 5]
                }
            })
        }

        

    }



}


export const HubBoundTravelDataLayerFactory = (options = {}) => new HubBoundTravelDataLayer(options);
