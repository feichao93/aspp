import { Set } from 'immutable'
import { eventChannel } from 'redux-saga'
import { put, select, take } from 'redux-saga/effects'
import { State } from '../reducer'
import { shortcutMap } from '../taskConfig'
import Decoration from '../types/Decoration'
import { annotate, clearAnnotation, setSel } from '../utils/actionCreators'

const emptySet = Set()

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
        const { range, doc }: State = yield select()
        if (range) {
          const intersected = range
            .filterIntersected(doc.annotationSet)
            .map(Decoration.fromAnnotation)
          yield put(setSel(intersected))
        }
      } else if (shortcutMap.has(event.key)) {
        yield put(annotate(shortcutMap.get(event.key)))
      }
    }
  } finally {
    chan.close()
  }
}
