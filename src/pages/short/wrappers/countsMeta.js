import React from "react"

import get from "lodash.get"

import { useAsyncSafe } from "@availabs/avl-components"

const countsMeta = Component =>
  ({ falcor, falcorCache, ...props }) => {
    const [loading, _setLoading] = React.useState(false),
      setLoading = useAsyncSafe(_setLoading);

    React.useEffect(() => {
      setLoading(true);
      falcor.get(["tds", "count", "meta", "length"])
        .then(res => {
          const length = +get(res, ["json", "tds", "count", "meta", "length"], 0);
          if (length) {
            return falcor.get([
              "tds", "count", "meta", "byIndex", { from: 0, to: length - 1 },
              ["id", "count_id", "upload_id", "status", "type", "start_date",
                "rc_station", "functional_class", "region_code", "county_code"
              ]
            ])
          }
        }).then(() => setLoading(false))
    }, [falcor, setLoading])

    const counts = React.useMemo(() => {
      const length = +get(falcorCache, ["tds", "count", "meta", "length"], 0);
      if (!length) return [];

      const counts = [];

      for (let i = 0; i < length; ++i) {

        const ref = get(falcorCache, ["tds", "count", "meta", "byIndex", i, "value"]),
          data = get(falcorCache, ref, null);
        if (data) {
          counts.push(data);
        }
      }
      return counts;
    }, [falcorCache]);

    return (
      <Component { ...props } counts={ counts }
        loading={ loading }/>
    )
  }
export default countsMeta
