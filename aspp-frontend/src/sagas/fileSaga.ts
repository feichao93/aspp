import { put, select, takeEvery } from 'redux-saga/effects'
import { Map } from 'immutable'
import { State } from '../reducers'
import { saveAs } from 'file-saver'
import Annotation from '../types/Annotation'
import { addAnnotations, deleteDecorations, setRange, toast } from '../utils/actionCreators'
import Action from '../utils/actions'
import { keyed, setNextId, toIdSet } from '../utils/common'

function* handleRequestDownloadResult() {
  const state: State = yield select()
  const annotations = state.main.annotations
  const content = JSON.stringify({ annotations }, null, 2)
  saveAs(new Blob([content], { type: 'text/plain;charset=utf-8' }), 'aspp-result.json')
}

function* handleLoadFileContent({ content }: Action.LoadFileContent) {
  try {
    const { main }: State = yield select()
    const object = JSON.parse(content).annotations
    yield put(setRange(null))
    yield put(deleteDecorations(toIdSet(main.gather())))
    const annotations = keyed(Map(object).map(Annotation.fromJS))
    // TODO max-id 不应该放在前端进行计算，需要放在后端
    const maxAnnotationId = annotations
      .keySeq()
      .map(id => Number(id.match(/\d+/)[0]))
      .max()
    setNextId('annotation', maxAnnotationId || 1)
    yield put(addAnnotations(annotations))
  } catch (e) {
    yield put(toast(e.message))
  }
}

export default function* fileSaga() {
  yield takeEvery('REQUEST_DOWNLOAD_RESULT', handleRequestDownloadResult)
  yield takeEvery('LOAD_FILE_CONTENT', handleLoadFileContent)
}
