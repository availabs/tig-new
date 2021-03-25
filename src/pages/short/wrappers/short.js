import React from "react"

import { useParams } from "react-router-dom"

import get from "lodash.get"
import { rollups } from "d3"

import { useAsyncSafe } from "@availabs/avl-components"

import { REGIONS, CLASSES, YEARS } from "./utils"

const shortWrapper = Component =>
  ({ falcor, falcorCache, ...props }) => {

    const [region, setRegion] = React.useState(1),
      [year, setYear] = React.useState(YEARS[0]),
      [loading, _setLoading] = React.useState(false),
      setLoading = useAsyncSafe(_setLoading);

    const params = useParams();

    React.useEffect(() => {
      const { region } = params;
      if (region) setRegion(region);
    }, [params]);

    React.useEffect(() => {
      falcor.get(["hds", "regions", "byId", REGIONS, ["region", "name"]]);
    }, [falcor]);

    React.useEffect(() => {
      if (region === null) return;

      setLoading(true);

      falcor.get([
        "ris", "byRegion", region, YEARS, "byClass", CLASSES,
        ['functional_class', 'aadt', 'length', 'vmt']
      ])
        .then(() => falcor.get(["ris", "short", "stations", "aggregate", region, year, "length"]))
        .then(res => {
          const length = +get(res, ["json", "ris", "short", "stations", "aggregate", region, year, "length"], 0);
          if (length) {
            return falcor.get(
              ["ris", "short", "stations", "aggregate", region, year, "byIndex",
                { from: 0, to: length - 1 }, "array"
              ]
            )
          }
        })
        .then(() =>
          falcor.get(["tds", "count", "meta", "byRegion", region, year, "length"])
        )
        .then(res => {
          const length = +get(res, ["json", "tds", "count", "meta", "byRegion", region, year, "length"], 0);
          if (length) {
            return falcor.get([
              "tds", "count", "meta", "byRegion", region, year, "byIndex", { from: 0, to: length - 1 },
              ["id", "rc_station", "upload_id", "start_date"]
            ])
          }
        })
        .then(() => setLoading(false));
    }, [falcor, region, setLoading, year]);

    const stationsWithUploads = React.useMemo(() => {
      const stations = [];
      const length = +get(falcorCache, ["tds", "count", "meta", "byRegion", region, year, "length"], 0);
      if (length) {
        for (let i = 0; i < length; ++i) {
          const ref = get(falcorCache, ["tds", "count", "meta", "byRegion", region, year, "byIndex", i, "value"]),
            data = get(falcorCache, ref, null);
          if (data) {
            stations.push(data);
          }
        }
      }
      return rollups(stations, d => d.length, d => d.start_date.slice(0, 4), d => d.rc_station.replace("_", ""))
        .reduce((a, c) => {
          a[c[0]] = c[1].reduce((a, c) => {
            a[c[0]] = c[1];
            return a;
          }, { year });
          return a;
        }, {});
    }, [falcorCache, region, year]);

    const stations = React.useMemo(() => {
      const length = +get(falcorCache, ["ris", "short", "stations", "aggregate", region, year, "length"], 0);

      const stations = [];

      for (let i = 0; i < length; ++i) {
        const ref = get(falcorCache, ["ris", "short", "stations", "aggregate", region, year, "byIndex", i, "value"]),
          data = get(falcorCache, ref);
        if (data) {
          stations.push(
            ...get(data, ["array", "value"], [])
              .map(d => {
                d.uploads = get(stationsWithUploads, [year, d.stationId], 0);
                return d;
              })
          );
        }
      }

      return stations;
    }, [falcorCache, region, year, stationsWithUploads]);

    const [Region, regions] = React.useMemo(() =>
      REGIONS.reduce((a, c) => {
        const data = get(falcorCache, ["hds", "regions", "byId", c], null);
        if (data) {
          if (+data.region === +region) {
            a[0] = data;
          }
          a[1].push(data);
        }
        return a;
      }, [{ region, name: `Region ${ region }` }, []])
    , [region, falcorCache]);

    const allClassData = React.useMemo(() =>
      YEARS.slice().reverse().map(year =>
        CLASSES.reduce((a, c) => {
          const data = get(falcorCache,
                            ["ris", "byRegion", region, year, "byClass", c],
                            {}
                          );
          a[c] = get(data, "vmt", 0);
          return a;
        }, { index: year }),
      ),
    [region, falcorCache])

    const fClassData = React.useMemo(() =>
      CLASSES.reduce((a, c) => {
        let data = get(falcorCache, ["ris", "byRegion", region, year, "byClass", c]);

        if (!data || !data.functional_class) {
          data = { functional_class: c, aadt: 0, vmt: 0, length: 0 };
        }
        a.push(data);

        return a;
      }, []),
    [region, falcorCache, year]);

    return (
      <Component { ...props } loading={ loading } stations={ stations }
        Region={ Region } setRegion={ setRegion }
        year={ year } setYear={ setYear } years={ YEARS }
        regions={ regions } fClassData={ fClassData }
        allClassData={ allClassData }/>
    )
  }

export default shortWrapper;
