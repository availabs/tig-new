import Landing from "pages/Landing"
import Views from "pages/Landing/tigDataSources/DataSourceView"
import AdminLanding from "pages/Landing/admin"
import NoMatch from "pages/404"
import Auth from "pages/auth"
import TestMap from "pages/map/MapIndex"
import Map from 'pages/map'

const Routes = [
  Landing,
  Views,
  AdminLanding,
  Auth,
  ...Map,
  ...TestMap,

  NoMatch
]

export default Routes
