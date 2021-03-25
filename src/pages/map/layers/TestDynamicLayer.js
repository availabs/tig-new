
import get from "lodash.get"

import { rollups } from "d3"

import { LayerContainer } from "@availabs/avl-map"

class TestDynamicLayer extends LayerContainer {
  name = "Dyanmic Counties"

  filters = {
    counties: {
      name: "Counties",
      type: "select",
      domain: [],
      value: [],
      searchable: true,
      accessor: d => d.name,
      valueAccessor: d => d.geoid,
      multi: true
    }
  }
  onHover = {
    layers: [`Dynamic-Counties-${ this.id }`],
    callback: (layerId, features, lngLat) => {

      const data = rollups(
        features, group => group.map(f => f.properties.geoid), f => f.layer.id
      ).reduce((a, [layerId, geoids]) => {
        a.push(["Dynamic Counties"],
          ...geoids.map(geoid => ["GeoID", geoid])
        );
        return a;
      }, []);
      return data;
    }
  }
  sources = [
    { id: "counties",
      source: {
        type: "vector",
        url: "mapbox://am3081.a8ndgl5n"
      }
    }
  ]
  layers = [
    { id: `Dynamic-Counties-${ this.id }`,
      filter: false,
      "source-layer": "counties",
      source: "counties",
      type: "fill",
      paint: {
        "fill-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#090",
          "#909"
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
    return falcor.get(["geo", "36", "counties",])
      .then(res => {
        const counties = get(res, ["json", "geo", "36", "counties"])
        return falcor.get(["geo", counties, "name"])
          .then(res => {
            this.filters.counties.domain = counties.map(geoid => {
              const name = get(res, ["json", "geo", geoid, "name"]);
              return { geoid, name };
            }).sort((a, b) => a.name.localeCompare(b.name));
          });
      });
  }
  render(map) {
    const counties = get(this, ["filters", "counties", "value"], []);
    if (counties.length) {
      map.setFilter(`Dynamic-Counties-${ this.id }`, ["in", ["get", "geoid"], ["literal", counties]]);
    }
    else {
      map.setFilter(`Dynamic-Counties-${ this.id }`, false);
    }
  }
}

export const TestDynamicLayerFactory = (options = {}) => new TestDynamicLayer(options);
