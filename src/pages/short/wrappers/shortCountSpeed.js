import React from "react"

import { useParams } from "react-router-dom"

import get from "lodash.get"

import { useAsyncSafe } from "@availabs/avl-components"

import { REGIONS, GLOBAL_ATTRIBUTES } from "./utils"

const basePath = ["tds", "short", "speed", "count", "data", "byCountId"];

const shortCountSpeed = Component =>
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
        falcor.get(["tds", "short", "speed", "weeklyAvg", "byCountId", metaId, "array"])
      ).then(() => falcor.get([...basePath, metaId, "length"]))
        .then(res => {
          const length = +get(res, ["json", ...basePath, metaId, "length"], 0);
          if (length) {
            return falcor.get(
              [...basePath, metaId, "byIndex", { from: 0, to: length - 1 },
                [...GLOBAL_ATTRIBUTES, "bins", "data_interval", "speed_limit"]
              ]
            )
          }
        }).then(() => setLoading(false))
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
      const counts = [];
      const length = +get(falcorCache, [...basePath, metaId, "length"], 0);
      let count_id = null;

      if (length) {
        for (let i = 0; i < length; ++i) {
          const ref = get(falcorCache, [...basePath, metaId, "byIndex", i, "value"]),
            data = get(falcorCache, ref, null);
          if (data) {
            count_id = data.count_id;
            counts.push({
              ...data,
              bins: get(data, ["bins", "value"], []),
              total: get(data, ["bins", "value"], []).reduce((a, c) => a + +c, 0),
              region: get(falcorCache, ["hds", "regions", "byId", data.region_code, "name"], data.region_code)
            })
          }
        }
      }
      return [counts, count_id];
    }, [metaId, falcorCache]);

    const weeklyAvg = React.useMemo(() => {
      return get(falcorCache, ["tds", "short", "speed", "weeklyAvg", "byCountId", metaId, "array", "value"], []);
    }, [metaId, falcorCache]);

    return (
      <Component { ...props } count_id={ count_id }
        meta={ meta } updateMeta={ updateMeta }
        counts={ counts } loading={ loading }
        weeklyAvg={ weeklyAvg }/>
    )
  }
export default shortCountSpeed;
