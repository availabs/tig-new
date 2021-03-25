import React from "react"

import { useParams } from "react-router-dom"

import get from "lodash.get"

import { useAsyncSafe } from "@availabs/avl-components"

import { REGIONS, GLOBAL_ATTRIBUTES } from "./utils"

const basePath = ["tds", "short", "volume", "count", "data", "byCountId"];

const shortCountVolume = Component =>
  ({ falcor, falcorCache, ...props }) => {
    const { metaId } = useParams();

    const [loading, _setLoading] = React.useState(false),
      setLoading = useAsyncSafe(_setLoading);

    React.useEffect(() => {
      falcor.get(["hds", "regions", "byId", REGIONS, ["region", "name"]]);
    }, [falcor]);

    React.useEffect(() => {
      setLoading(true);
      falcor.get([
        "tds", "count", "meta", "byId", metaId,
        ["id", "metaId", "upload_id", "status", "type", "date",
          "rc_station", "functional_class", "region_code", "county_code"
        ]
      ]).then(() =>
        falcor.get(["tds", "short", "volume", "weeklyAvg", "byCountId", metaId, "array"])
          .then(() => falcor.get([...basePath, metaId, "length"]))
          .then(res => {
            const length = +get(res, ["json", ...basePath, metaId, "length"], 0);
            if (length) {
              return falcor.get(
                [...basePath, metaId, "byIndex", { from: 0, to: length - 1 },
                  [...GLOBAL_ATTRIBUTES, "intervals", "vehicle_axle_code"]
                ]
              )
            }
          })
      ).then(() => setLoading(false))
    }, [falcor, metaId, setLoading]);

    const updateMeta = React.useCallback((id, status) => {
      setLoading(true);
      falcor.call(["tds", "update", "count", "meta", "status"], [[id, status]])
        .then(() => setLoading(false));
    }, [falcor, setLoading]);

    const meta = React.useMemo(() => {
      return get(falcorCache, ["tds", "count", "meta", "byId", metaId])
    }, [metaId, falcorCache]);

    const [counts, count_id] = React.useMemo(() => {
      const counts = [],
        length = +get(falcorCache, [...basePath, metaId, "length"], 0);
      let count_id = null;

      if (length) {
        for (let i = 0; i < length; ++i) {
          const ref = get(falcorCache, [...basePath, metaId, "byIndex", i, "value"]),
            data = get(falcorCache, ref, null);

          if (data) {
            count_id = data.count_id;

            counts.push({
              ...data,
              intervals: get(data, ["intervals", "value"], [])
                .filter((v, i) => {
                  if (+data.collection_interval === 60) {
                    return (i % 4) === 0;
                  }
                  return true;
                }),
              total: get(data, ["intervals", "value"], []).reduce((a, c) => a + +c, 0),
              region: get(falcorCache, ["hds", "regions", "byId", data.region_code, "name"], data.region_code)
            })
          }
        }
      }
      return [counts, count_id];
    }, [metaId, falcorCache]);

    // React.useEffect(() => {
    //   if (!counts.length) return;
    //
    //   const { rc_station, year } = counts.reduce((a, c) => {
    //     a.rc_station = c.rc_station.replace("_", "");
    //     a.year = c.date.slice(0, 4);
    //     return a;
    //   }, {});
    //
    //   falcor.get([
    //     "ris", "short", "stations", "aggregate", year, "byId", rc_station, "array"
    //   ]).then(res => console.log("RES:", res));
    // }, [falcor, counts]);

    const weeklyAvg = React.useMemo(() => {
      return get(falcorCache, ["tds", "short", "volume", "weeklyAvg", "byCountId", metaId, "array", "value"], []);
    }, [metaId, falcorCache]);

    return (
      <Component { ...props } count_id={ count_id }
        meta={ meta } updateMeta={ updateMeta }
        counts={ counts } loading={ loading }
        weeklyAvg={ weeklyAvg }/>
    )
  }
export default shortCountVolume;
