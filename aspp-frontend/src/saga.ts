import { eventChannel } from 'redux-saga'
import { fork, put, take } from 'redux-saga/effects'
import { setRange } from './actionCreators'
import SelectionUtils from './utils/SelectionUtils'

function* autoUpdateRange() {
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
  yield fork(autoUpdateRange)
}
