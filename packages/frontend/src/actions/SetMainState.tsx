import { put, select } from 'little-saga/compat'
import { State } from '../reducers'
import MainState from '../types/MainState'
import Action from '../utils/actions'
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
    yield put(Action.setMainState(this.prevState))
  }

  *next() {
    yield put(Action.setMainState(this.nextState))
  }
}
