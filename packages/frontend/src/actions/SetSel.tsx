import { Set } from 'immutable'
import { put, select } from 'little-saga/compat'
import { State } from '../reducers'
import { setSel } from '../reducers/mainReducer'
import Action from '../utils/actions'
import MainAction from './MainAction'

export enum SetSelMethod {
  select = 'select',
  toggle = 'toggle',
  intersection = 'intersection',
  autoClear = 'autoClear',
  manualClear = 'manualClear',
}

export default class SetSel extends MainAction {
  prevSel: Set<string>

  constructor(readonly nextSel: Set<string>, readonly method: SetSelMethod) {
    super()
  }

  getMessage() {
    if (this.nextSel.isEmpty()) {
      return '清空选中'
    } else {
      return `选中 ${this.nextSel.count()} 个对象`
    }
  }

  *prepare() {
    const { main, history }: State = yield select()
    const last = history.getLastAction()
    if (last instanceof SetSel) {
      const { intersection, autoClear, select, toggle } = SetSelMethod
      if (
        (this.method === last.method || last.method === autoClear) &&
        (this.method === toggle || this.method === select || this.method === intersection)
      ) {
        yield put(Action.historyPop())
        this.prevSel = last.prevSel
        return
      }
    }

    this.prevSel = main.sel
  }

  *prev() {
    yield put(setSel(this.prevSel))
  }

  *next() {
    yield put(setSel(this.nextSel))
  }
}
