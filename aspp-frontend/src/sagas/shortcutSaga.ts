import { Set } from 'immutable'
import { eventChannel } from 'redux-saga'
import { put, select, take } from 'redux-saga/effects'
import { State } from '../reducers'
import CONFIG from '../taskConfig'
import { acceptCurrent, annotateCurrent, deleteCurrent, setSel } from '../utils/actionCreators'
import { toIdSet } from '../utils/common'

export default function* shortcutSaga() {
  const chan = eventChannel(emit => {
    document.addEventListener('keydown', emit)
    return () => document.removeEventListener('keydown', emit)
  })

  try {
    while (true) {
      const event: KeyboardEvent = yield take(chan)
      if (event.key === 'Escape') {
        yield put(setSel(Set()))
      } else if (event.key === 'Backspace' || event.key === 'd') {
        yield put(deleteCurrent())
      } else if (event.key === 'Enter' || event.key === 'a') {
        yield put(acceptCurrent())
      } else if (event.key === 's') {
        const { main }: State = yield select()
        if (main.range) {
          const intersected = main.range.intersected(main.gather())
          yield put(setSel(toIdSet(intersected)))
        }
      } else if (CONFIG.shortcutMap.has(event.key)) {
        yield put(annotateCurrent(CONFIG.shortcutMap.get(event.key)))
      }
    }
  } finally {
    chan.close()
  }
}
