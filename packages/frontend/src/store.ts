import { createSagaMiddleware } from 'little-saga'
import { applyMiddleware, createStore } from 'redux'
import reducer from './reducers/index'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()
const store = createStore(reducer, applyMiddleware(sagaMiddleware))
sagaMiddleware.run(rootSaga)

export default store
