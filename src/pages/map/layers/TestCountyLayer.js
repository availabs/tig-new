
import get from "lodash.get"

import { rollups } from "d3"

import { getColorRange } from "@availabs/avl-components"

import { LayerContainer } from "@availabs/avl-map"

import { TestDynamicLayerFactory } from "./TestDynamicLayer"
import { TestModal1, TestModal2 } from "./TestModal"

class TestCountyLayer extends LayerContainer {
  name = "Counties"

  state = {
    key1: "value1",
    key2: "value2"
  }

  filters = {
    counties: {
      name: "Counties",
      type: "select",
      domain: [],
      value: ["36001", "36093", "36083"],
      searchable: true,
      accessor: d => d.name,
      valueAccessor: d => d.geoid,
      multi: true
    }
  }
  onHover = {
    layers: ["Counties"],
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
    domain: [0, 12, 23, 34, 45, 45, 56, 67, 89, 93, 106, 116, 125, 134, 147, 150],
    range: getColorRange(5, "BrBG", true),
    format: ",.1f",

    show: true,
    title: "Legend Test"
  }
  infoBoxes = [
    { Header: "Counties Info Box",
      Component: ({ layer }) => {
        return (
          <div>
            TEST INFO BOX WITH A HEADER<br />
            TEST INFO BOX WITH A HEADER<br />
            TEST INFO BOX WITH A HEADER<br />
            TEST INFO BOX WITH A HEADER<br />
            TEST INFO BOX WITH A HEADER<br />
            { JSON.stringify(layer.state) }
          </div>
        )
      }
    },
    { Component: ({ layer }) => (
        <div>
          TEST INFO BOX WITHOUT A HEADER<br />
          THIS IS NOT CLOSABLE<br />
          TEST INFO BOX WITHOUT A HEADER<br />
          THIS IS NOT CLOSABLE<br />
          TEST INFO BOX WITHOUT A HEADER<br />
          THIS IS NOT CLOSABLE<br />
          TEST INFO BOX WITHOUT A HEADER<br />
          THIS IS NOT CLOSABLE<br />
          TEST INFO BOX WITHOUT A HEADER<br />
          THIS IS NOT CLOSABLE<br />
          { JSON.stringify(layer.state) }
        </div>
      )
    }
  ]
  modals = {
    test1: {
      Component: TestModal1,
      Header: "Test Modal 1"
    },
    test2: {
      Component: TestModal2,
      Header: "Test Modal 2"
    }
  }
  mapActions = [
    { tooltip: "Does Seomthing",
      icon: "fa-thumbs-up",
      action: MapActions => this.updateState({ key1: "thumbs-up", key2: "test1" })
    },
    { tooltip: "Does Seomthing Else",
      icon: "fa-cog",
      action: MapActions => this.updateState({ key1: "cog", key2: "test2" })
    },
    { tooltip: "Does Seomthing Else",
      icon: "fa-tools",
      action: MapActions => this.updateState({ key1: "tools", key2: "test3" })
    }
  ]
  toolbar = [
    "toggle-visibility",
    { tooltip: "Add Dynamic Layer 1",
      icon: "fa-thumbs-up",
      action: MapActions => MapActions.addDynamicLayer(TestDynamicLayerFactory())
    },
    { tooltip: "Add Dynamic Layer 2",
      icon: "fa-surprise",
      action: function(MapActions) {
        MapActions.addDynamicLayer(this.createDynamicLayer());
      }
    },
    { tooltip: "Open Modal 1",
      icon: "fa-cog",
      action: MapActions => MapActions.showModal(this.id, "test1")
    },
    { tooltip: "Open Modal 2",
      icon: "fa-tools",
      action: MapActions => MapActions.showModal(this.id, "test2")
    }
  ]
  sources = [
    { id: "counties",
      source: {
        type: "vector",
        url: "mapbox://am3081.a8ndgl5n"
      }
    }
  ]
  layers = [
    { id: "Counties",
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
          5, 1.0,
          20, 0.1
        ]
      }
    }
  ]

  init(map, falcor) {
    return falcor.get(["geo", "36", "counties"])
      .then(res => {
        const counties = get(res, ["json", "geo", "36", "counties"])
        return falcor.get(
          ["geo", counties, "name"]
        )
        .then(res => {
          this.filters.counties.domain = counties.map(geoid => {
            const name = get(res, ["json", "geo", geoid, "name"]);
            return { geoid, name };
          }).sort((a, b) => a.name.localeCompare(b.name));
        });
      });
  }
  fetchData() {
    return new Promise(resolve => setTimeout(resolve, (Math.random(500) + 500)));
  }
  render(map) {
    const counties = get(this, ["filters", "counties", "value"], []);
    if (counties.length) {
      map.setFilter("Counties", ["in", ["get", "geoid"], ["literal", counties]]);
    }
    else {
      map.setFilter("Counties", false);
    }
    const colors = counties.reduce((a, c, i) => ({
      ...a, [c]: this.legend.range[i % this.legend.range.length]
    }), {});
    map.setPaintProperty("Counties", "fill-color", [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      "#090",
      ["get", ["get", "geoid"], ["literal", colors]]
    ])
  }
  createDynamicLayer() {
console.log("THIS:", this)
    return TestDynamicLayerFactory();
  }
  doSomething(map) {
    window.alert(`Layer ${ this.name } did something!!!`);
  }
}

export const TestCountyLayerFactory = (options = {}) => new TestCountyLayer(options);
