import { saveAs } from 'file-saver'
import { Map } from 'immutable'
import { fork, put, select, takeEvery } from 'redux-saga/effects'
import { State } from '../reducers'
import { TreeState } from '../reducers/treeReducer'
import Annotation from '../types/Annotation'
import {
  addAnnotations,
  deleteDecorations,
  loadData,
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
      yield put(toast('fail to load data from server'))
    }
  } catch (e) {
    yield put(toast('fail to load data from server'))
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
  const block = main.doc.blocks.get(0)
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

function* handleClickDocTreeNode({ docname }: Action.ClickDocTreeNode) {
  console.log('handleClickDocTreeNode', docname)
  try {
    const response = yield fetchHost(`/api/doc/${docname}`)
    if (response.ok) {
      const text = yield response.text()
      // console.log(text)
    } else {
      throw new Error('response not ok')
    }
  } catch (e) {
    console.error(e)
    yield put(toast(e.message))
  }
}

function* handleClickAnnotationSetTreeNode({
  docname,
  annotationSetName,
}: Action.ClickAnnotationSetTreeNode) {
  // const { main }: State = yield select()
  console.log('handleClickAnnotationSetTreeNode', docname, annotationSetName)
  try {
    const response = yield fetchHost(`/api/annotation-set/${docname}/${annotationSetName}`)
    if (response.ok) {
      const json = yield response.json()
      // console.log(json)
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

  yield takeEvery('CLICK_DOC_TREE_NODE', handleClickDocTreeNode)
  yield takeEvery('CLICK_ANNOTATION_SET_TREE_NODE', handleClickAnnotationSetTreeNode)
}
