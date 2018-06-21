import { put, select } from 'little-saga/compat'
import { State } from '../reducers'
import MainState from '../types/MainState'
import { setMainState } from '../utils/actionCreators'
import MainAction from './MainAction'

export default class SetMainState extends MainAction {
  prevState: MainState

  constructor(readonly nextState: MainState, readonly message: string) {
    super()
  }

  getMessage() {
    return this.message
  }

  *prepare() {
    const { main }: State = yield select()
    this.prevState = main
  }

  *prev() {
    yield put(setMainState(this.prevState))
  }

  *next() {
    yield put(setMainState(this.nextState))
  }
}
