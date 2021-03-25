import React from "react"

import { Content } from "@availabs/avl-components"

import StationsTable from "./components/StationsTable"

const Continuous = ({ stations }) => {
  return (
    <Content>
      <StationsTable stations={ stations }/>
    </Content>
  )
}
export default Continuous;
