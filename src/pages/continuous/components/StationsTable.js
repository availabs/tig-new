import React from "react"

import { Table, useTheme } from "@availabs/avl-components"

const Columns = [
  { id: "stationId",
    accessor: d => d.stationId,
    Header: "Station ID"
  },
  { id: "dataTypes",
    accessor: d => d.data_type,
    Header: "Data Types",
    Cell: ({ value }) => value.split(",").join(", ")
  },
  { id: "muni",
    accessor: d => d.muni,
    Header: "Municipality"
  }
];

const StationsTable = ({ stations }) => {
  const theme = useTheme();
  return !stations.length ? null : (
    <div className={ `${ theme.headerBg } rounded-md pb-6` }>
      <Table columns={ Columns }
        initialPageSize={ 15 }
        data={ stations }
        sortBy="muni"/>
    </div>
  )
}
export default StationsTable;
