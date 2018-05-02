import { eventChannel } from 'redux-saga'
import { fork, put, take } from 'redux-saga/effects'
import { setRange } from '../utils/actionCreators'
import SelectionUtils from '../utils/SelectionUtils'

function* autoUpdateRangeAccordingToNativeSelection() {
  const chan = eventChannel(emit => {
    const callback = () => emit('change')
    document.addEventListener('selectionchange', callback)
    return () => document.removeEventListener('selectionchange', callback)
  })

  try {
    while (true) {
      yield take(chan)
      const range = SelectionUtils.getCurrentRange()
      yield put(setRange(range))
    }
  } finally {
    chan.close()
  }
}

export default function* rootSaga() {
  console.log('root-saga started')
  yield fork(autoUpdateRangeAccordingToNativeSelection)
}
