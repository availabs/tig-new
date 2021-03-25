import React from "react"

import { Table, useTheme } from "@availabs/avl-components"

import { format as d3format } from "d3-format"

const floatFormat = d3format(",.1f");

const ValueHeader = ({ children }) =>
  <div className="text-right pr-8">
    { children }
  </div>
const ValueCell = ({ value }) =>
  <div className="text-right pr-8">
    { floatFormat(value) }
  </div>

const COLUMNS = [
  { accessor: "functional_class",
    Header: "Functional Class",
    Cell: ({ value }) =>
      <div className="pl-4">
        { value }
      </div>,
    disableFilters: true
  },
  { accessor: "vmt",
    Header: <ValueHeader>VMT</ValueHeader>,
    Cell: ValueCell,
    disableFilters: true
  },
  { accessor: "length",
    Header: <ValueHeader>Miles</ValueHeader>,
    Cell: ValueCell,
    disableFilters: true
  }
]

const ClassTable = ({ fClassData }) => {
  const theme = useTheme();
  return !fClassData.length ? null : (
    <div className={ `${ theme.headerBg } rounded-md pb-4` }>
      <Table initialPageSize={ 14 }
        columns={ COLUMNS }
        sortBy="functional_class" sortOrder="asc"
        data={ fClassData }/>
    </div>
  )
}

export default ClassTable;
