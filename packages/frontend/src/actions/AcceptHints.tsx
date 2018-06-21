import { Map } from 'immutable'
import { put, select } from 'little-saga/compat'
import React from 'react'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import { deleteDecorations } from '../reducers/mainReducer'
import { Hint } from '../types/Decoration'
import MainState from '../types/MainState'
import { setMainState } from '../utils/actionCreators'
import { toIdSet } from '../utils/common'
import MainAction from './MainAction'

export default class AcceptHints extends MainAction {
  oldState: MainState

  constructor(readonly accepting: Map<string, Hint>) {
    super()
  }

  getMessage() {
    return (
      <span>
        接受
        {this.accepting
          .valueSeq()
          .map((hint, index) => <span key={index}>{Rich.string(hint.hint)}</span>)
          .toArray()}
      </span>
    )
  }

  *prepare() {
    const { main }: State = yield select()
    this.oldState = main
  }

  *prev() {
    yield put(setMainState(this.oldState))
  }

  *next() {
    const actions = this.accepting.map(hint => hint.action).filter(Boolean)
    yield put(deleteDecorations(toIdSet(this.accepting)))
    // TODO performance degradation
    // 用户可能会一下子选中很多 hint，然后一次性进行接受，这里一个一个处理 action 比较低效
    yield* actions.map(action => put(action)).valueSeq()
  }
}
