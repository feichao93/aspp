import '@blueprintjs/core/lib/css/blueprint.css'
import 'normalize.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Route, Router } from 'react-router-dom'
import App from './components/App/App'
import './custom-typings'
import store from './store'
import history from './utils/history'

declare global {
  const VERSION: string
}

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route component={App} />
    </Router>
  </Provider>,
  document.getElementById('container'),
)
