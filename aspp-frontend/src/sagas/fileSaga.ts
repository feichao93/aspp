import { Intent } from '@blueprintjs/core'
import { saveAs } from 'file-saver'
import { List, Map, Seq } from 'immutable'
import { fork, put, select, takeEvery } from 'redux-saga/effects'
import { State } from '../reducers'
import { TreeState } from '../reducers/treeReducer'
import Annotation from '../types/Annotation'
import MainState from '../types/MainState'
import {
  addAnnotations,
  annotationsSaved,
  deleteDecorations,
  loadData,
  setMainState,
  setRange,
  toast,
} from '../utils/actionCreators'
import Action from '../utils/actions'
import { keyed, setNextId, toIdSet } from '../utils/common'
import layout from '../utils/layout'
import fetchHost from './fetchHost'

/** 从后台加载文档树 */
function* loadTreeState() {
  try {
    const response = yield fetchHost('/api/list')
    if (response.ok) {
      const treeState: TreeState = yield response.json()
      yield put(loadData(treeState))
    } else {
      yield put(toast('fail to load data from server', Intent.DANGER))
    }
  } catch (e) {
    yield put(toast('fail to load data from server', Intent.DANGER))
  }
}

function* handleRequestDownloadResultJSON() {
  const state: State = yield select()
  const annotations = state.main.annotations.valueSeq().toArray()
  const content = JSON.stringify({ annotations }, null, 2)
  saveAs(new Blob([content], { type: 'text/plain;charset=utf-8' }), 'aspp-result.json')
}

function* handleRequestDownloadResultBIO() {
  const { main }: State = yield select()
  // TODO 暂时先只考虑 block-0
  const block = main.blocks.get(0)
  const lines: string[] = []
  const rootNode = layout(block, 0, main.annotations.toSet())
  for (const { decoration } of rootNode.children) {
    const { startOffset, endOffset } = decoration.range
    if (decoration.type === 'text') {
      for (let i = startOffset; i < endOffset; i++) {
        lines.push(`${block[i]} O`) // other
      }
    } else if (decoration.type === 'annotation') {
      if (startOffset + 1 === endOffset) {
        lines.push(`${block[startOffset]} S-${decoration.tag}`)
      } else {
        // BME
        lines.push(`${block[startOffset]} B-${decoration.tag}`)
        for (let i = startOffset + 1; i < endOffset - 1; i++) {
          lines.push(`${block[i]} M-${decoration.tag}`)
        }
        lines.push(`${block[endOffset - 1]} E-${decoration.tag}`)
      }
    }
  }
  const content = lines.map(line => line + '\n').join('')
  saveAs(new Blob([content], { type: 'text/plain;charset=utf-8' }), 'aspp-result.anns')
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

/** 保存当前的标注工作进度 */
function* saveCurrentAnnotationSet() {
  const { main }: State = yield select()
  const { docname, annotationSetName } = main
  try {
    const response = yield fetchHost(`/api/annotation-set/${docname}/${annotationSetName}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ annotations: main.annotations.valueSeq() }),
    })
    if (response.ok) {
      yield put(annotationsSaved())
      yield put(toast('Saved'))
    } else {
      throw new Error('response not ok')
    }
  } catch (e) {
    console.error(e)
    yield put(toast(e.message, Intent.DANGER))
  }
}

function* handleRequestOpenAnnotationSetFile({
  docname,
  annotationSetName,
}: Action.RequestOpenAnnotationSetFile) {
  const { main }: State = yield select()
  if (main.docname === docname && main.annotationSetName === annotationSetName) {
    return
  }
  if (main.altered) {
    if (!window.confirm('有尚未保存的内容，跳转前将对当前文件进行自动保存')) {
      return
    }
    yield saveCurrentAnnotationSet()
  }

  try {
    console.log('opening doc...', docname)
    const res1 = yield fetchHost(`/api/doc/${docname}`)
    if (res1.ok) {
      const text = yield res1.text()
      console.log('opening annotation set...', docname, annotationSetName)
      const res2 = yield fetchHost(`/api/annotation-set/${docname}/${annotationSetName}`)
      if (res2.ok) {
        const json = yield res2.json()
        const mainState = new MainState({
          docname,
          annotationSetName,
          blocks: List([text]),
          annotations: keyed(Seq(json.annotations).map(Annotation.fromJS)),
          // TODO hints & slots
        })
        yield put(setMainState(mainState))
      } else {
        throw new Error('response not ok')
      }
    } else {
      throw new Error('response not ok')
    }
  } catch (e) {
    console.error(e)
    yield put(toast(e.message))
  }
}

function* handleRequestAddAnnotationSet({ docname }: Action.RequestAddAnnotationSet) {
  const annotationSetName = window.prompt('请输入标注集合名称：')
  if (annotationSetName == null) {
    return
  }
  try {
    const response = yield fetchHost(`/api/annotation-set/${docname}/${annotationSetName}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ annotations: [] }),
    })
    if (response.ok) {
      yield loadTreeState()
    } else {
      throw new Error('response not ok')
    }
  } catch (e) {
    console.error(e)
    yield put(toast(e.message))
  }
}

function* handleRequestDeleteAnnotationSet({
  docname,
  annotationSetName,
}: Action.RequestDeleteAnnotationSet) {
  try {
    const response = yield fetchHost(`/api/annotation-set/${docname}/${annotationSetName}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      yield loadTreeState()
      yield put(toast(`Deleted. ${docname}/${annotationSetName}.`))
    } else {
      throw new Error('response not ok')
    }
  } catch (e) {
    console.error(e)
    yield put(toast(e.message))
  }
}

export default function* fileSaga() {
  yield fork(loadTreeState)

  yield takeEvery(
    (action: Action) => action.type === 'REQUEST_DOWNLOAD_RESULT' && action.format === 'json',
    handleRequestDownloadResultJSON,
  )
  yield takeEvery(
    (action: Action) => action.type === 'REQUEST_DOWNLOAD_RESULT' && action.format === 'bio',
    handleRequestDownloadResultBIO,
  )
  yield takeEvery('LOAD_FILE_CONTENT', handleLoadFileContent)
  yield takeEvery('REQUEST_ADD_ANNOTATION_SET', handleRequestAddAnnotationSet)
  yield takeEvery('REQUEST_DELETE_ANNOTATION_SET', handleRequestDeleteAnnotationSet)

  yield takeEvery('REQUEST_SAVE_CURRENT_ANNOTATION_SET', saveCurrentAnnotationSet)
  yield takeEvery('REQUEST_OPEN_ANNOTATION_SET_FILE', handleRequestOpenAnnotationSetFile)
}
