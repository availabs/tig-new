import React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import ScrollToTop from 'utils/ScrollToTop'
import { createBrowserHistory } from 'history';
import Routes from 'Routes';

import {
  DefaultLayout,
  Messages
} from "@availabs/avl-components"

export const history = createBrowserHistory({basename: process.env.PUBLIC_URL});

class App extends React.Component {
  render() {
    return (
      <BrowserRouter basename={process.env.REACT_APP_PUBLIC_URL}>
        <ScrollToTop />
        <Switch>
          { Routes.map((route, i) =>
              <DefaultLayout key={ i } { ...route } { ...this.props }
                menus={ Routes.filter(r => r.mainNav) }/>
            )
          }
        </Switch>
        <Messages/>
      </BrowserRouter>
    );
  }
}
const mapStateToProps = state => {
    return ({

    });
}

const mapDispatchToProps = { createBrowserHistory };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
