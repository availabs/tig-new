import React from "react"

import { Select } from "@availabs/avl-components"

import { ValueDisplay } from "./CountMeta"

const CountStatus = ({ id, status, updateMeta }) => {
  const doUpdate = React.useCallback(v => {
    updateMeta(id, v);
  }, [id, updateMeta]);
  return (
    <div className="max-w-lg">
      <ValueDisplay label="Meta ID" value={ id }/>
      <div className="mb-2 mr-2">
        <div className="flex items-center">
          <span className="mr-2 font-bold">Status</span>
          <div className="flex-1">
            <Select value={ status } onChange={ doUpdate }
              multi={ false }
              removable={ false }
              searchable={ false }
              options={ ["pending", "approved", "rejected"] }/>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CountStatus
