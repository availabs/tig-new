import React from "react"

import { rollups } from "d3"

import { Table } from "@availabs/avl-components"

import get from "lodash.get"

import { REGIONS } from "./wrappers/utils"

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

const COLUMNS = [
  { accessor: "name",
    Header: "Name"
  },
  { accessor: "year",
    Header: "Year"
  },
  { accessor: "type",
    Header: "Type"
  },
  { accessor: "method",
    Header: "Method"
  }
]
const ADJUSTMENT_COLUMNS = {
  vehicle: [
    { accessor: "functional_class",
      Header: () => {
        return (
          <div className="text-center">
            Functional Class
          </div>
        )
      },
      Cell: ({ value }) => {
        return (
          <div className="text-center">
            { +value < 10 ? "rural" : "urban" }{ " - " }{ value }
          </div>
        )
      }
    }
  ],
  seasonal: [
    { accessor: "factor_group",
      Header: () => {
        return (
          <div className="text-right pr-8">
            Factor Group
          </div>
        )
      },
      Cell: ({ value }) => {
        let cell = value;
        switch (+value) {
          case 30:
            cell = "urban - 30";
            break;
          case 40:
            cell = "suburban - 40";
            break;
          case 60:
            cell = "recreational - 60"
            break;
          default:
            break;
        }
        return (
          <div className="text-right pr-8">
            { cell }
          </div>
        )
      }
    }
  ]
}
REGIONS.forEach(r => {
  ADJUSTMENT_COLUMNS.vehicle.push({
    accessor: r.toString(),
    Header: `Region ${ r }`
  })
})
for (let m = 1; m <= 12; ++m) {
  ADJUSTMENT_COLUMNS.seasonal.push({
    accessor: m.toString(),
    Header: MONTHS[m - 1]
  })
}
const ADJUSTMENT_REDUCERS = {
  vehicle: group =>
    group.reduce((a, c) =>
      ({ ...a, [c.region_code]: c.axle_factor, functional_class: c.functional_class })
    , {}),
  seasonal: group =>
    group.reduce((a, c) =>
      ({ ...a, [c.month]: c.seasonal_factor, factor_group: c.factor_group })
    , {})
}
const ADJUSTMENT_ROLLUPS = {
  vehicle: adjustments =>
    rollups(adjustments, ADJUSTMENT_REDUCERS.vehicle, d => d.functional_class),
  seasonal: adjustments =>
    rollups(adjustments, ADJUSTMENT_REDUCERS.seasonal, d => d.factor_group)
}
const ADJUSTMENT_SORT = {
  vehicle: (a, b) => +b.functional_class - +a.functional_class,
  seasonal: (a, b) => + b.factor_group - +a.factor_group
}

const AdjustmentFactors = ({ meta, factorId, factorType, setFactor, adjustments }) => {

  const onRowClick = React.useCallback((e, row) => {
    const type = row.original.type === "axle_adjustment" ? "vehicle" : "seasonal";
    setFactor(row.original.id, type);
  }, [setFactor]);

  const selected = meta.reduce((a, c) => c.id === factorId ? c : a, {});

  const rolledup = get(ADJUSTMENT_ROLLUPS, factorType, d => d)(adjustments)
    .map(d => d[1])
    .sort(get(ADJUSTMENT_SORT, factorType));

  return (
    <div className="m-10 grid grid-cols-1 gap-y-6">

      <Table data={ meta }
        columns={ COLUMNS }
        sortBy="year"
        onRowClick={ onRowClick }
        sortOrder="desc"/>

      { !selected.name ? null :
        <div className="border"/>
      }

      <div>
        <div className="font-bold text-xl mb-2">
          { selected.name }
        </div>
        <Table data={ rolledup }
          columns={ get(ADJUSTMENT_COLUMNS, factorType, []) }
          initialPageSize={ 14 }
          disableFilters={ true }
          disableSortBy={ true }/>
      </div>
    </div>
  )
}
export default AdjustmentFactors;
