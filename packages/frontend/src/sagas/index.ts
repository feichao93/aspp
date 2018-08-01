import { fork, put, select, setContext, takeEvery } from 'little-saga/compat'
import { State } from '../reducers'
import Action from '../utils/actions'
import { a } from '../utils/common'
import InteractionCollector from '../utils/InteractionCollector'
import devHelper from './devHelper'
import { promptDialogSaga } from './dialogSaga'
import fileSaga from './fileSaga'
import handleUserInteractions from './handleUserInteractions'
import historyManager from './historyManager'
import nativeSelectionManager from './nativeSelectionManager'
import shortcutSaga from './shortcutSaga'
import taskManager from './taskManager'
import { handleToast } from './toaster'

/** 如果当前没有设置用户名的话，提示用户输入用户名 */
function* ensureUsername() {
  const { config }: State = yield select()
  if (config.username == null) {
    yield put(Action.reqSetUsername())
  }
}

function* handleReqSetUsername() {
  const username = yield promptDialogSaga('请输入你的用户名')
  if (username != null) {
    yield put(Action.setUsername(username))
  }
}

window.addEventListener('beforeunload', e => {
  const msg = '确定要退出么？'
  e.returnValue = msg
  return msg
})

export default function* rootSaga() {
  console.log('root-saga started')

  yield setContext({ collector: new InteractionCollector() })

  yield fork(nativeSelectionManager)
  yield fork(shortcutSaga)
  yield fork(taskManager)
  yield fork(fileSaga)
  yield fork(historyManager)
  yield fork(handleUserInteractions)

  yield takeEvery(a('TOAST'), handleToast)
  yield takeEvery(a('REQ_SET_USERNAME'), handleReqSetUsername)

  yield fork(ensureUsername)
  yield fork(devHelper)
}
