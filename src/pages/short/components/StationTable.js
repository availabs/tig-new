import React from "react"

import { Table, useTheme } from "@availabs/avl-components"

import { format as d3format } from "d3-format"

const intFormat = d3format(",d");

const COLUMNS = [
  // { accessor: "stationId",
  //   Header: "Station ID"
  // },
  { accessor: "region",
    Header: "Region",
    disableFilters: true,
    Cell: ({ value }) => (
      <span className="whitespace-nowrap mr-1">{ value }</span>
    )
  },
  // { accessor: "mpo",
  //   Header: "MPO"
  // },
  // { accessor: "county",
  //   Header: "County"
  // },
  // { accessor: "year",
  //   Header: "Year"
  // },
  { accessor: "functional_class",
    Header: "Functional Class",
    disableFilters: true
  },
  { accessor: "road_name",
    Header: "Road Name",
    disableFilters: true
  },
  { accessor: "total_lanes",
    Header: "Lanes",
    disableFilters: true
  },
  { accessor: "beg_mp",
    Header: "Begin MP",
    disableFilters: true
  },
  { accessor: "end_mp",
    Header: "End MP",
    disableFilters: true
  },
  { accessor: "length",
    Header: "Miles",
    disableFilters: true
  },
  { accessor: "aadt",
    Header: "AADT",
    Cell: ({ value }) => intFormat(value),
    disableFilters: true
  },
  { accessor: "aadt_combo",
    Header: "AADT Combo",
    Cell: ({ value }) => intFormat(value),
    disableFilters: true
  },
  { accessor: "aadt_single_unit",
    Header: "AADT Single",
    Cell: ({ value }) => intFormat(value),
    disableFilters: true
  }
];

const ExpandRow = ({ values: [{ begin_description, end_description }] }) =>
  <div className="text-center">
    <div className="grid grid-cols-12 font-bold">
      <div className="col-span-6 mx-1 border-b-2">
        Begin Description
      </div>
      <div className="col-span-6 mx-1 border-b-2">
        End Description
      </div>
    </div>
    <div className="grid grid-cols-12">
      <div className="col-span-6">
        { begin_description }
      </div>
      <div className="col-span-6">
        { end_description }
      </div>
    </div>
  </div>

const StationsTable = ({ station }) => {

  const theme = useTheme();
  return !station.length ? null : (
    <div className={ `${ theme.headerBg } rounded-md pb-6` }>
      <Table columns={ COLUMNS }
        initialPageSize={ 15 }
        ExpandRow={ ExpandRow }
        data={
          station.map(s =>
            ({ ...s,
              expand: [{
                begin_description: s.begin_description,
                end_description: s.end_description
              }]
            })
          )
        }
        sortBy="aadt"
        sortOrder="desc"/>
    </div>
  )
}
export default StationsTable;
