import React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';

import ScrollToTop from 'utils/ScrollToTop'

import Routes from 'Routes';

import {
  DefaultLayout,
  Messages
} from "@availabs/avl-components"

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <ScrollToTop />
        <Switch>
          { Routes.map((route, i) =>
              <DefaultLayout key={ i } { ...route } { ...this.props }
                menus={ Routes.filter(r => r.mainNav) }/>
            )
          }
        </Switch>
        <Messages />
      </BrowserRouter>
    );
  }
}
export default App
