import { applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import reducer from './reducers/index'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()
const store = createStore(reducer, applyMiddleware(sagaMiddleware))
sagaMiddleware.run(rootSaga)

window.addEventListener('beforeunload', () => {
  const state = store.getState()
  if (state.misc.darkTheme) {
    localStorage.setItem('dark-theme', 'true')
  } else {
    localStorage.removeItem('dark-theme')
  }
})

export default store
