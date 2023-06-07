import {getColorRange} from "components/avl-components/src"

export const HOVER_COLOR = "#f16913";
export const acsCensusCategoryMappings = [
    {value:'22',name:'Absolute and Relative Minority Population data',year:2013},
    {value:'132',name:'Absolute and Relative Minority Population data',year:2014},
    {value:'134',name:'Absolute and Relative Minority Population data',year:2015},
    {value:'142',name:'Absolute and Relative Minority Population data',year:2016},
    {value:'146',name:'Absolute and Relative Minority Population data',year:2017},
    {value:'145',name:'Absolute and Relative Minority Population data',year:2018},
    {value:'18',name: 'Absolute and Relative Population Below Poverty',year:2013},
    {value:'128',name: 'Absolute and Relative Population Below Poverty',year:2014},
    {value:'133',name: 'Absolute and Relative Population Below Poverty',year:2015},
    {value:'143',name: 'Absolute and Relative Population Below Poverty',year:2016},
    {value:'147',name: 'Absolute and Relative Population Below Poverty',year:2017},
    {value:'144',name: 'Absolute and Relative Population Below Poverty',year:2018},
]


export const sources = [
        { id: "counties-2017",
          source: {
            'type': "vector",
            'url': 'mapbox://am3081.a8ndgl5n'
          },
        },
        { id: "tracts-2017",
          source: {
            'type': "vector",
            'url': 'mapbox://am3081.2x2v9z60'
          },
        },
        { id: "blockgroup-2017",
          source: {
              'type': "vector",
              'url': 'mapbox://am3081.52dbm7po'
          }
        },
        { id: "counties-2020",
          source: {
            'type': "vector",
            'url': 'https://tiles.availabs.org/data/tl_2020_36_county.json'
          },
        },
        { id: "tracts-2020",
          source: {
            'type': "vector",
            'url': 'https://tiles.availabs.org/data/tl_2020_36_tract.json'
          },
        },
        { id: "blockgroup-2020",
          source: {
              'type': "vector",
              'url': 'https://tiles.availabs.org/data/tl_2020_36_bg.json'
          }
        },
    ]

export const layers = [
        { 'id': 'counties-2017',
      'source': 'counties-2017',
      'source-layer': 'counties',
      'type': 'fill',
      filter : ['in', 'geoid', 'none']
    },
    { 'id': 'tracts-2017',
      'source': 'tracts-2017',
      'source-layer': 'tracts',
      'type': 'fill',
      filter : ['in', 'geoid', 'none']
    },
    { id: "blockgroup-2017",
      source: "blockgroup-2017",
      'source-layer': "blockgroups",
      'type': 'fill',
      filter : ['in', 'geoid', 'none']
    },
    

    { 'id': 'counties-line-2017',
      'source': 'counties-2017',
      'source-layer': 'counties',
      'type': 'line',
      paint: {
        "line-width": 2,
        "line-color": HOVER_COLOR,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "pinned"], false],
          1.0, 0.0
        ]
      }
    },
    { 'id': 'tracts-line-2017',
      'source': 'tracts-2017',
      'source-layer': 'tracts',
      'type': 'line',
      paint: {
        "line-width": 2,
        "line-color": HOVER_COLOR,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "pinned"], false],
          1.0, 0.0
        ]
      }
    },
    { 'id': 'blockgroup-line-2017',
      'source': 'blockgroup-2017',
      'source-layer': 'blockgroups',
      'type': 'line',
      paint: {
        "line-width": 2,
        "line-color": HOVER_COLOR,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "pinned"], false],
          1.0, 0.0
        ]
      }
    },

    


    { 'id': 'counties-2020',
      'source': 'counties-2020',
      'source-layer': 'tl_2020_us_county',
      'type': 'fill',
      filter : ['in', 'geoid', 'none']
    },
    
    { 'id': 'tracts-2020',
      'source': 'tracts-2020',
      'source-layer': 'tl_2020_36_tract',
      'type': 'fill',
      filter : ['in', 'geoid', 'none']
    },
    { id: "blockgroup-2020",
      source: "blockgroup-2020",
      'source-layer': "tl_2020_36_bg",
      'type': 'fill',
      filter : ['in', 'geoid', 'none']
    },
    

    { 'id': 'counties-line-2020',
      'source': 'counties-2020',
      'source-layer': 'tl_2020_us_county',
      'type': 'line',
      paint: {
        "line-width": 2,
        "line-color": HOVER_COLOR,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "pinned"], false],
          1.0, 0.0
        ]
      }
    },
    { 'id': 'tracts-line-2020',
      'source': 'tracts-2020',
      'source-layer': 'tl_2020_36_tract',
      'type': 'line',
      paint: {
        "line-width": 2,
        "line-color": HOVER_COLOR,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "pinned"], false],
          1.0, 0.0
        ]
      }
    },
    { 'id': 'blockgroup-line-2020',
      'source': 'blockgroup-2020',
      'source-layer': 'tl_2020_36_bg',
      'type': 'line',
      paint: {
        "line-width": 2,
        "line-color": HOVER_COLOR,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "pinned"], false],
          1.0, 0.0
        ]
      }
    },

    ]

export const CENSUS_FILTER_CONFIG = [
 {  name: "Percent American Indian and Alaska Native alone",
    censusKeys: ['B02001_004E'],
    divisorKeys: ['B02001_001E'],
    group: "Overview",
    range: getColorRange(5, "Oranges", false),
  },

 { name: "Percent Asian alone",
    censusKeys: ['B02001_005E'],
    divisorKeys: ['B02001_001E'],
    group: "Overview",
    range: getColorRange(5, "BuPu", false),
  },

 { name: "Percent Black or African American alone",
    censusKeys: ['B02001_003E'],
    divisorKeys: ['B02001_001E'],
    group: "Overview",
    range: getColorRange(5, "RdBu", false),
  },

 { name: "Percent Hispanic or Latino",
    censusKeys: ['B03001_003E'],
    divisorKeys: ['B02001_001E'],
    group: "Overview",
    range: getColorRange(5, "BuPu", false),
  },

 { name: "Percent Native Hawaiian and Other Pacific Islander alone",
    censusKeys: ['B02001_006E'],
    divisorKeys: ['B02001_001E'],
    group: "Overview",
    range: getColorRange(5, "GnBU", false),
  },

 { name: "Percent Some other race alone",
    censusKeys: ['B02001_007E'],
    divisorKeys: ['B02001_001E'],
    group: "Overview",
    range: getColorRange(5, "Greens", false),
  },

 { name: "Percent Two or more races",
    censusKeys: ['B02001_008E'],
    divisorKeys: ['B02001_001E'],
    group: "Overview",
    range: getColorRange(5, "RdGy", false),
  },

 { name: "Percent White alone",
    censusKeys: ['B02001_002E'],
    divisorKeys: ['B02001_001E'],
    group: "Overview",
    range: getColorRange(5, "Blues", false),
  },
  { name: "Percent Households with No Vehicles",
    censusKeys: ['B08201_002E'],
    divisorKeys: ['B08201_001E'],
    group: "Transportation",
    range: getColorRange(5, "RdGy", false)
  },
  { name: "Percent Worked at home",
    censusKeys: ['B08006_017E'],
    divisorKeys: ['B080011_001E'],
    group: "Transportation"
  },

   { name: "Percent workers no vehicle available",
    censusKeys: ['B08014_002E'],
    divisorKeys: ['B08014_001E'],
    group: "Transportation"
  },

]