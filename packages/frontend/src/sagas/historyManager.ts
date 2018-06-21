import { put, select, takeEvery } from 'little-saga/compat'
import MainAction, { ActionCategory } from '../actions/MainAction'
import { State } from '../reducers'
import { emptyAction } from '../types/MainHistory'
import { historyBack, historyForward, historyPush } from '../utils/actionCreators'
import { a } from '../utils/common'

export function* applyMainAction(mainAction: MainAction) {
  yield* mainAction.prepare()
  yield* mainAction.next()
  yield put(historyPush(mainAction))
}

function* handleRevert() {
  while (true) {
    const state: State = yield select()
    const action = state.history.getLastAction()
    if (action === emptyAction) {
      break
    }
    yield* action.prev()
    yield put(historyBack())
    if (action.category === ActionCategory.sideEffects) {
      break
    }
  }
}

function* handleUndo() {
  const state: State = yield select()
  const action = state.history.getLastAction()
  if (action === emptyAction) {
    return
  }
  yield* action.prev()
  yield put(historyBack())
}

function* handleRedo() {
  const state: State = yield select()
  const action = state.history.getNextAction()
  if (action === emptyAction) {
    return
  }
  yield* action.next()
  yield put(historyForward())
}

export default function* historyManager() {
  yield takeEvery(a('USER_REQUEST_UNDO'), handleUndo)
  yield takeEvery(a('USER_REQUEST_REVERT'), handleRevert)
  yield takeEvery(a('USER_REQUEST_REDO'), handleRedo)
}
