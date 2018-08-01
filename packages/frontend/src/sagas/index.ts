import { io, takeEvery } from 'little-saga'
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
  const { config }: State = yield io.select()
  if (config.username == null) {
    yield io.put(Action.reqSetUsername())
  }
}

function* handleReqSetUsername() {
  const username = yield promptDialogSaga('请输入你的用户名')
  if (username != null) {
    yield io.put(Action.setUsername(username))
  }
}

window.addEventListener('beforeunload', e => {
  const msg = '确定要退出么？'
  e.returnValue = msg
  return msg
})

export default function* rootSaga() {
  console.log('root-saga started')

  yield io.setContext({ collector: new InteractionCollector() })

  yield io.fork(nativeSelectionManager)
  yield io.fork(shortcutSaga)
  yield io.fork(taskManager)
  yield io.fork(fileSaga)
  yield io.fork(historyManager)
  yield io.fork(handleUserInteractions)

  yield takeEvery(a('TOAST'), handleToast)
  yield takeEvery(a('REQ_SET_USERNAME'), handleReqSetUsername)

  yield io.fork(ensureUsername)
  yield io.fork(devHelper)
}
