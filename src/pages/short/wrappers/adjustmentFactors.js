import React from "react"

import get from "lodash.get"

import { useAsyncSafe } from "@availabs/avl-components"

const INITIAL_STATE = {
  meta: [],
  factorId: null,
  factorType: null,
  loading: 0
}
const Reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "update-loading":
      return {
        ...state,
        loading: state.loading + payload.loading
      }
    case "set-meta":
    case "set-factor":
      return {
        ...state,
        ...payload
      }
    default:
      return state;
  }
}

const adjustmentFactors = Component =>
  ({ falcor, falcorCache, ...props }) => {

    const [state, dispatch] = React.useReducer(Reducer, INITIAL_STATE);

    const _updateLoading = React.useCallback(loading => {
      dispatch({ type: "update-loading", loading })
    }, []);
    const updateLoading = useAsyncSafe(_updateLoading)

    const setFactor = React.useCallback((factorId, factorType) => {
      dispatch({ type: "set-factor", factorId, factorType });
    }, []);

    React.useEffect(() => {
      updateLoading(1);
      falcor.get(["tds", "adjustment", "factors", "meta", "length"])
        .then(res => {
          const length = +get(res, ["json", "tds", "adjustment", "factors", "meta", "length"]);
          if (length) {
            return falcor.get([
              "tds", "adjustment", "factors", "meta", "byIndex", { from: 0, to: length - 1 },
              ["id", "name", "year", "type", "method", "year_default"]
            ])
          }
        }).then(() => updateLoading(-1))
    }, [falcor, updateLoading]);

    React.useEffect(() => {
      if (!state.meta.length) {
        const length = +get(falcorCache, ["tds", "adjustment", "factors", "meta", "length"], 0);

        const meta = [];

        for (let i = 0; i < length; ++i) {
          const ref = get(falcorCache, ["tds", "adjustment", "factors", "meta", "byIndex", i, "value"], null),
            data = get(falcorCache, ref, null);
          if (data) {
            meta.push(data);
          }
        }
        if (meta.length) {
          dispatch({ type: "set-meta", meta });
        }
      }
    }, [falcorCache, state.meta]);

    const { factorId, factorType } = state;

    React.useEffect(() => {
      if (!factorId) return;

      updateLoading(1);
      falcor.get(
        ["tds", factorType, "adjustment", "factors", "byFactorId", factorId, "array"]
      ).then(() => updateLoading(-1));
    }, [falcor, updateLoading, factorId, factorType]);

    const adjustments = React.useMemo(() => {
      if (!factorId) return [];

      return get(falcorCache,
        ["tds", factorType, "adjustment", "factors", "byFactorId", factorId, "array", "value"]
      , []);
    }, [falcorCache, factorId, factorType]);

    return (
      <Component { ...props } { ...state } loading={ Boolean(state.loading) }
        setFactor={ setFactor }
        adjustments={ adjustments }/>
    )
  }
export default adjustmentFactors;
