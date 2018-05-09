import { select, takeEvery } from 'redux-saga/effects'
import { State } from '../reducers'
import { saveAs } from 'file-saver'

function* handleRequestDownloadResult() {
  const state: State = yield select()
  const annotations = state.main.annotations
  const content = JSON.stringify({ annotations }, null, 2)
  saveAs(new Blob([content], { type: 'text/plain;charset=utf-8' }), 'annotation-set-xxxx.json')
}

export default function* fileSaga() {
  yield takeEvery('REQUEST_DOWNLOAD_RESULT', handleRequestDownloadResult)
}
