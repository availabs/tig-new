import Landing from "pages/Landing"
import AdminLanding from "pages/Landing/admin"
import NoMatch from "pages/404"
import Auth from "pages/auth"
import Map from "pages/map/MapIndex"
import TestMap from 'pages/map/TestPage'

const Routes = [
  Landing,
  AdminLanding,
  Auth,
  ...Map,
  ...TestMap,

  NoMatch
]

export default Routes
