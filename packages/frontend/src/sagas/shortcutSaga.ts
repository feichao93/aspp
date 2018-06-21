import { eventChannel, put, take } from 'little-saga/compat'
import ASPP_CONFIG from '../aspp-config'
import {
  requestSaveCurrentColl,
  userAcceptCurrent,
  userAnnotateCurrent,
  userClearSel,
  userDeleteCurrent,
  userRequestRedo,
  userRequestUndo,
  userSelectCurrent,
} from '../utils/actionCreators'
import schedulers from '../utils/schedulers'

/** 绑定快捷键 */
export default function* shortcutSaga() {
  const chan = eventChannel<KeyboardEvent>(emit => {
    const callback = (e: KeyboardEvent) => schedulers.batch(emit, e)
    document.addEventListener('keydown', callback)
    return () => document.removeEventListener('keydown', callback)
  })

  try {
    while (true) {
      const event: KeyboardEvent = yield take(chan)
      if ((event.target as Element).tagName === 'INPUT') {
        continue
      }
      if (event.key === 'Escape') {
        yield put(userClearSel('manual'))
      } else if (event.key === 'Backspace' || event.key === 'd') {
        yield put(userDeleteCurrent())
      } else if (event.key === 'Enter' || event.key === 'a') {
        yield put(userAcceptCurrent())
      } else if (event.key === 's' && !event.ctrlKey) {
        yield put(userSelectCurrent())
      } else if (event.key === 's' && event.ctrlKey) {
        event.preventDefault()
        yield put(requestSaveCurrentColl())
      } else if (ASPP_CONFIG.shortcutMap.has(event.key)) {
        yield put(userAnnotateCurrent(ASPP_CONFIG.shortcutMap.get(event.key)))
      } else if (event.key === 'z' && event.ctrlKey) {
        yield put(userRequestUndo())
      } else if (event.key === 'y' && event.ctrlKey) {
        yield put(userRequestRedo())
      }
    }
  } finally {
    chan.close()
  }
}
