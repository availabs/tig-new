import React from "react"

import { Link } from "react-router-dom"

import { Table } from "@availabs/avl-components"

const UploadColumns = [
  { id: "fileName",
    accessor: d => d.meta.fileName,
    Header: "File Name"
  },
  { accessor: "status",
    Header: "Status"
  },
  { id: "dataType",
    accessor: d => d.meta.dataType,
    Header: "Data Type"
  },
  { accessor: "created_at",
    Header: "Uploaded At",
    Cell: ({ value }) => {
      const date = new Date(value);
      return date.toDateString();
    }
  },
  { accessor: "created_by",
    Header: "Uploaded By"
  }
]
const CountColumns = [
  { accessor: "count_id",
    Header: "Count ID",
    Cell: ({ value, row }) => (
      <Link to={ `/short/${ row.original.data_type }/count/${ row.original.id }` }
        className="block hover:text-cyan-400">
        <span className="fa fa-external-link-alt mr-2"/>
        { value }
      </Link>
    )
  },
  { id: "type",
    accessor: d => `${ d.count_type } ${ d.data_type }`,
    Header: "Type"
  },
  { accessor: "status",
    Header: "Status"
  }
]

const ExpandRow = ({ values }) => {
  return (
    <div>
      { JSON.stringify(values[0].meta) }
    </div>
  )
}

const UploadedShorts = ({ uploads, counts, setUploadId, ...props }) => {

  const onUploadedRowClick = React.useCallback((e, row) => {
    setUploadId(["short", row.values.dataType.toLowerCase(), row.original.upload_id]);
  }, [setUploadId]);

  // const { push } = useHistory();

  // const onRowClick = React.useCallback((e, row) => {
  //   push(`/short/${ row.original.data_type }/count/${ row.original.id }`);
  // }, [push]);

  return (
    <div className="m-10">
      <Table data={ uploads }
        onRowClick={ onUploadedRowClick }
        ExpandRow={ ExpandRow }
        columns={ UploadColumns }/>
      { !counts.length ? null :
        <div className="mt-4">
          <Table data={ counts }
            // onRowClick={ onRowClick }
            columns={ CountColumns }/>
        </div>
      }
    </div>
  )
}
export default UploadedShorts;
