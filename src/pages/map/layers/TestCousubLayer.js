import React from "react"

import get from "lodash.get"

import { rollups } from "d3"

import { LayerContainer } from "@availabs/avl-map"

const HoverComp = ({ data, layer }) => {
  return (
    <div className="p-1">
      <div className="border-2 rounded px-2">
        <div className="text-center">
          I'm a custom hover component!!!
        </div>
        { data.map((row, i) =>
            <div key={ i } className="flex">
              { row.map((d, ii) =>
                  <div key={ ii }
                    className={ `
                      ${ ii === 0 ? "flex-1 font-bold" : "flex-0" }
                      ${ row.length > 1 && ii === 0 ? "mr-4" : "" }
                      ${ row.length === 1 && ii === 0 ? "border-b-2" : "" }
                    ` }>
                    { d }
                  </div>
                )
              }
            </div>
          )
        }
        <div className="text-center">
          WOOHOO!!!
        </div>
      </div>
    </div>
  )
}

class TestCousubLayer extends LayerContainer {
  name = "Cousubs"

  filters = {
    cousubs: {
      name: "Cousubs",
      type: "select",
      domain: [],
      value: ["3600101000"],
      searchable: true,
      accessor: d => d.name,
      valueAccessor: d => d.geoid,
      multi: true
    }
  }
  onHover = {
    layers: ["Cousubs"],
    callback: (layerId, features, lngLat) => {
      const data = rollups(
        features, group => group.map(f => f.properties.geoid), f => f.layer.id
      ).reduce((a, [layerId, geoids]) => {
        a.push([layerId],
          ...geoids.map(geoid => ["GeoID", geoid])
        );
        return a;
      }, []);
      return data;
    },
    HoverComp
  }
  infoBoxes = [
    { Header: "Cousubs Info Box",
      Component: props => (
        <div>
          TEST INFO BOX WITH A HEADER<br />
          TEST INFO BOX WITH A HEADER<br />
          TEST INFO BOX WITH A HEADER<br />
          TEST INFO BOX WITH A HEADER<br />
          TEST INFO BOX WITH A HEADER
        </div>
      )
    }
  ]
  sources = [
    { id: "cousubs",
      source: {
        'type': "vector",
        'url': 'mapbox://am3081.36lr7sic'
      },
    }
  ]
  layers = [
    { id: "Cousubs",
      filter: false,
      "source-layer": "cousubs",
      source: "cousubs",
      type: "fill",
      paint: {
        "fill-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#090",
          "#009"
        ],
        "fill-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5, 1.0,
          20, 0.1
        ]
      }
    }
  ]
  init(map, falcor) {
    return falcor.get(["geo", "36", "cousubs"])
      .then(res => {
        const cousubs = get(res, ["json", "geo", "36", "cousubs"]);
        return falcor.chunk(
            ["geo", cousubs, "name"],
            // { onProgress: (curr, total) => { console.log("progress:", curr / total); } }
          )
          .then(res => {
            const cache = falcor.getCache();
            this.filters.cousubs.domain = cousubs.map(geoid => {
              const name = get(cache, ["geo", geoid, "name"]);
              return { geoid, name };
            }).sort((a, b) => a.name.localeCompare(b.name));
          })
      });
  }
  render(map) {
    const cousubs = get(this, ["filters", "cousubs", "value"], []);
    if (cousubs.length) {
      map.setFilter("Cousubs", ["in", ["get", "geoid"], ["literal", cousubs]]);
    }
    else {
      map.setFilter("Cousubs", false);
    }
  }
}

export const TestCousubLayerFactory = (options = {}) => new TestCousubLayer(options);
