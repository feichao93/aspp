import { Intent, Toaster } from '@blueprintjs/core'
import { fork, put, select, setContext, takeEvery } from 'little-saga/compat'
import { State } from '../reducers'
import Action from '../utils/actions'
import { a } from '../utils/common'
import InteractionCollector from '../utils/InteractionCollector'
import devHelper from './devHelper'
import fileSaga from './fileSaga'
import handleUserInteractions from './handleUserInteractions'
import historyManager from './historyManager'
import nativeSelectionManager from './nativeSelectionManager'
import shortcutSaga from './shortcutSaga'
import taskManager from './taskManager'

/** 如果当前没有设置用户名的话，提示用户输入用户名 */
function* ensureUsername() {
  const { config }: State = yield select()
  if (config.username == null) {
    const username = prompt('Input your username')
    yield put(Action.setUsername(username))
  }
}

const toaster = Toaster.create()
function handleToast({ message, intent = Intent.PRIMARY }: Action.Toast) {
  toaster.show({ intent, message })
}

export default function* rootSaga() {
  console.log('root-saga started')

  yield setContext({ collector: new InteractionCollector() })

  yield ensureUsername()
  yield fork(nativeSelectionManager)
  yield fork(shortcutSaga)
  yield fork(taskManager)
  yield fork(fileSaga)
  yield fork(historyManager)
  yield fork(handleUserInteractions)

  yield takeEvery(a('TOAST'), handleToast)

  yield fork(devHelper)
}
