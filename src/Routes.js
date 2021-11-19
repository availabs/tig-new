import Catalog from "pages/catalog"
import Views from "pages/catalog/tigDataSources/DataSourceView"
import AdminLanding from "pages/catalog/admin"
import NoMatch from "pages/404"
import Auth from "pages/auth"
import TestMap from "pages/map/MapIndex"
import Map from 'pages/map'
import Chart from 'pages/chart'
import Table from 'pages/table'
import Metadata from 'pages/metadata'

const Routes = [
  Catalog,
  Views,
  AdminLanding,
  Auth,
  ...Map,
  Table,
  Chart,
  Metadata,
  ...TestMap,

  NoMatch
]

export default Routes
