import React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import ScrollToTop from 'utils/ScrollToTop'
import Routes from 'Routes';
import TigLayout from 'components/tig/TigLayout'

import {
  DefaultLayout,
  Messages
} from "@availabs/avl-components"

const App = (props) => { 
    return (
      <BrowserRouter basename={process.env.REACT_APP_PUBLIC_URL}>
        <ScrollToTop />
        <Switch>
          { Routes.map((route, i) =>
              <DefaultLayout 
                key={ i }
                layout={TigLayout}
                { ...route } 
                { ...props }
                menus={ Routes.filter(r => r.mainNav) }/>
            )
          }
        </Switch>
        <Messages/>
      </BrowserRouter>
    );
}

export default App;