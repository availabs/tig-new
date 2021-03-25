import React from "react"

import { useParams } from "react-router-dom"

import get from "lodash.get"
import { format as d3format } from "d3"

import { YEARS, REGIONS } from "./utils"

import { useAsyncSafe } from "@availabs/avl-components"

const numFormat = d3format(",d");

const capitalize = string =>
  string.trim().split(" ").map(s =>
    s.toLowerCase().split("")
      .map((dd, i) => i === 0 ? dd.toUpperCase() : dd).join("")
  ).join(" ")

const shortStations = Component =>
  ({ falcor, falcorCache }) => {

    const { stationId } = useParams(),
      [loading, _setLoading] = React.useState(false),
      setLoading = useAsyncSafe(_setLoading);

    React.useEffect(() => {
      setLoading(true);
      falcor.get(["hds", "regions", "byId", REGIONS, ["region", "name"]])
        .then(() =>
          falcor.get([
            "ris", "short", "stations", "aggregate", YEARS, "byId", stationId, "array"
          ])
        )
        .then(() =>
          falcor.get(["tds", "count", "meta", "byStation", stationId, "length"])
        )
        .then(res => {
          const length = +get(res, ["json", "tds", "count", "meta", "byStation", stationId, "length"], 0);
          if (length) {
            return falcor.get(
              ["tds", "count", "meta", "byStation", stationId, "byIndex", { from: 0, to: length - 1 },
                ["rc_station", "count_id", "id", "start_date", "type", "status"]
              ]
            )
          }
        })
        .then(() =>
          falcor.get(["ris", "stations", stationId, YEARS, "array"])
        ).then(() => setLoading(false));
    }, [falcor, stationId, setLoading]);

    const Regions = React.useMemo(() => {
      return REGIONS.reduce((a, c) => {
        const data = get(falcorCache, ["hds", "regions", "byId", c], {});
        a[c] = data;
        return a;
      }, {});
    }, [falcorCache]);

    const station = React.useMemo(() => {
      const data = YEARS.slice().reverse().map(year => {
        const data = get(falcorCache,
          ["ris", "short", "stations", "aggregate", year, "byId", stationId, "array", "value"], []
        )
        .map(d => {
          const dd = { ...d };
          dd.region = get(Regions, [dd.region, "name"], dd.region);
          dd.county = capitalize(d.county || "");
          dd.road_name = [...new Set((d.road_name || "").split(",").map(capitalize))];
          const max = 25;
          if (dd.road_name.length > max) {
            const num = dd.road_name.length;
            dd.road_name = dd.road_name.slice(0, max);
            dd.road_name.push(`plus ${ numFormat(num - max) } more...`)
          }
          return dd;
        });
        return { year, data };
      });

      return { stationId, data };
    }, [falcorCache, stationId, Regions]);

    const [uploadIndex, setUploadIndex] = React.useState(0);

    const uploads = React.useMemo(() => {
      const uploads = [];
      const length = +get(falcorCache, ["tds", "count", "meta", "byStation", stationId, "length"], 0);
      if (length) {
        for (let i = 0; i < length; ++i) {
          const ref = get(falcorCache, ["tds", "count", "meta", "byStation", stationId, "byIndex", i, "value"]),
            data = get(falcorCache, ref, null);
          if (data) {
            uploads.push(data);
          }
        }
      }
      return uploads
        .map((d, i) => ({ ...d, index: i }))
        .sort((a, b) => +b.start_date.replace("_", "") - +a.start_date.replace("_", ""));
    }, [falcorCache, stationId]);

    const stations = React.useMemo(() => {
      return YEARS.reduce((a, c) => {
        const data = get(falcorCache, ["ris", "stations", stationId, c, "array", "value"], []);
        a.push(...data);
        return a;
      }, [])
        .map(d => ({ ...d,
          region: get(falcorCache, ["hds", "regions", "byId", d.region, "name"], d.region),
          county: capitalize(d.county || ""),
          road_name: capitalize(d.road_name || "")
        }))
        .sort((a, b) => +a.year - +b.year);
    }, [falcorCache, stationId]);

    return (
      <Component station={ station } years={ YEARS } stations={ stations }
        loading={ loading }
        index={ uploadIndex }
        setIndex={ setUploadIndex }
        uploads={ uploads }/>
    )
  }
export default shortStations;
