import Landing from "pages/Landing"
import AdminLanding from "pages/Landing/admin"
import NoMatch from "pages/404"

import Auth from "pages/auth"

import TestMap from "pages/map/MapIndex"

const Routes = [
  Landing,
  AdminLanding,
  Auth,
  ...TestMap,

  NoMatch
]

export default Routes
