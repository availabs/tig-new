import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { API_HOST } from 'config'
import { AUTH_HOST, PROJECT_NAME, CLIENT_HOST } from 'config'

import { Provider } from 'react-redux';
import store from 'store';

import TDS_THEME from "./theme"
import {
  FalcorProvider,
  ThemeContext,
  falcorGraph,
  addComponents,
  addWrappers
} from "components/avl-components/src"

import reportWebVitals from './reportWebVitals';

import {
  Components as AmsComponents,
  Wrappers as AmsWrappers,
  enableAuth
} from "@availabs/ams"

import 'index.css';

addComponents(AmsComponents);
addWrappers(AmsWrappers);

console.log('something new')


const AuthEnabledApp = enableAuth(App, { AUTH_HOST, PROJECT_NAME, CLIENT_HOST });


ReactDOM.render(
  <React.StrictMode>
   	<Provider store={ store }>
  		<FalcorProvider falcor={ falcorGraph(API_HOST) }>
        <ThemeContext.Provider value={TDS_THEME}>
          <AuthEnabledApp />
        </ThemeContext.Provider>
      </FalcorProvider>
  	</Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals();
