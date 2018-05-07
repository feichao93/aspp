import { OrderedSet, Set } from 'immutable'
import { eventChannel } from 'redux-saga'
import { put, select, take } from 'redux-saga/effects'
import { State } from '../reducers/index'
import { shortcutMap } from '../taskConfig'
import Decoration from '../types/Decoration'
import { annotate, clearAnnotation, setSel } from '../utils/actionCreators'

const emptySet = OrderedSet()

export default function* shortcutSaga() {
  const chan = eventChannel(emit => {
    document.addEventListener('keydown', emit)
    return () => document.removeEventListener('keydown', emit)
  })

  try {
    while (true) {
      const event: KeyboardEvent = yield take(chan)
      if (event.key === 'Escape') {
        yield put(setSel(emptySet))
      } else if (event.key === 'Backspace' || event.key === 'd') {
        yield put(clearAnnotation())
      } else if (event.key === 's') {
        const { main }: State = yield select()
        if (main.range) {
          // TODO ??? 只用 main.annotations 就足够了么
          const intersected = main.range.filterIntersected(main.annotations)
          yield put(setSel(intersected.keySeq().toOrderedSet()))
        }
      } else if (shortcutMap.has(event.key)) {
        yield put(annotate(shortcutMap.get(event.key)))
      }
    }
  } finally {
    chan.close()
  }
}
