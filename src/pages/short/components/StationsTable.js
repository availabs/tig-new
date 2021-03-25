import React from "react"

import { Link } from "react-router-dom"

import { Table, useTheme } from "@availabs/avl-components"

import { format as d3format } from "d3-format"

const intFormat = d3format(",d");

const COLUMNS = [
  { accessor: "stationId",
    Header: "RC Station ID",
    Cell: ({ value }) => (
      <Link to={ `/short/station/${ value }` }
        className="block hover:text-cyan-400">
        <span className="fa fa-external-link-alt mr-2"/>
        { value }
      </Link>
    )
  },
  { accessor: "uploads",
    Header: "Uploads"
  },
  { accessor: "mpo",
    Header: "MPO"
  },
  { accessor: "county",
    Header: "County"
  },
  { accessor: "functional_class",
    Header: "Functional Classes",
    Cell: ({ value }) => value.split(",").sort((a, b) => +a - +b).join(", ")
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

const ExpandRow = ({ values: [{ functional_class, road_name, length }] }) =>
  <div className="text-center">
    <div className="grid grid-cols-12 font-bold">
      <div className="col-span-9 mx-1 border-b-2">
        Road Names
      </div>
      <div className="col-span-3 mx-1 border-b-2">
        Total Length
      </div>
    </div>
    <div className="grid grid-cols-12">
      <div className="col-span-9">
        { road_name.split(",").join(", ") }
      </div>
      <div className="col-span-3">
        { length }
      </div>
    </div>
  </div>

const StationsTable = ({ stations }) => {
  // const history = useHistory();

  // const onRowClick = React.useCallback((e, row) => {
  //   history.push(`/short/station/${ row.values.stationId }`);
  // }, [history]);

  const theme = useTheme();
  return !stations.length ? null : (
    <div className={ `${ theme.headerBg } rounded-md pb-6` }>
      <Table columns={ COLUMNS }
        initialPageSize={ 15 }
        ExpandRow={ ExpandRow }
        // onRowClick={ onRowClick }
        data={
          stations.map(s =>
            ({ ...s,
              expand: [{
                functional_class: s.functional_class,
                road_name: s.road_name,
                length: `${ s.length } miles`
              }]
            })
          )
        }
        sortBy="uploads"
        sortOrder="desc"/>
    </div>
  )
}
export default StationsTable;
