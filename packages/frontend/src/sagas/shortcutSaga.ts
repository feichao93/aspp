import { eventChannel, io } from 'little-saga'
import ASPP_CONFIG from '../aspp-config'
import Action from '../utils/actions'
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
      const event: KeyboardEvent = yield io.take(chan)
      if ((event.target as Element).tagName === 'INPUT') {
        continue
      }
      if (event.key === 'Escape') {
        yield io.put(Action.userClearSel('manual'))
      } else if (event.key === 'Backspace' || event.key === 'd') {
        yield io.put(Action.userDeleteCurrent())
      } else if (event.key === 'Enter' || event.key === 'a') {
        yield io.put(Action.userAcceptCurrent())
      } else if (event.key === 's' && !event.ctrlKey) {
        yield io.put(Action.userSelectCurrent())
      } else if (event.key === 's' && event.ctrlKey) {
        event.preventDefault()
        yield io.put(Action.reqSaveCurrentColl())
      } else if (ASPP_CONFIG.shortcutMap.has(event.key)) {
        yield io.put(Action.userAnnotateCurrent(ASPP_CONFIG.shortcutMap.get(event.key)))
      } else if (event.key === 'z' && event.ctrlKey) {
        yield io.put(Action.userReqUndo())
      } else if (event.key === 'y' && event.ctrlKey) {
        yield io.put(Action.userReqRedo())
      }
    }
  } finally {
    chan.close()
  }
}
