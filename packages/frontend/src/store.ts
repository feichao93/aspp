import createSagaMiddleware from 'little-saga/compat'
import { applyMiddleware, createStore } from 'redux'
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

  if (state.misc.hideTaskTree) {
    localStorage.setItem('hide-task-tree', 'true')
  } else {
    localStorage.removeItem('hide-task-tree')
  }

  if (state.misc.username != null) {
    localStorage.setItem('username', state.misc.username)
  } else {
    localStorage.removeItem('username')
  }
})

export default store
