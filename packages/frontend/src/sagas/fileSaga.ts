import { Intent } from '@blueprintjs/core'
import { is, List, Map, Seq } from 'immutable'
import { getContext, put, select, takeEvery, takeLatest } from 'little-saga/compat'
import EmptyMainAction from '../actions/EmptyMainAction'
import { ActionCategory } from '../actions/MainAction'
import { State } from '../reducers'
import { setCachedAnnotations } from '../reducers/cacheReducer'
import { DocStatState, updateDocStat } from '../reducers/docStatReducer'
import { TreeDoc, TreeState } from '../reducers/treeReducer'
import Annotation from '../types/Annotation'
import MainState from '../types/MainState'
import {
  historyClear,
  loadData,
  requestLoadTree,
  requestOpenColl,
  setMainState,
  toast,
} from '../utils/actionCreators'
import Action from '../utils/actions'
import { a, keyed, updateAnnotationNextId } from '../utils/common'
import { DOC_STAT_NAME } from '../utils/constants'
import { applyMainAction } from './historyManager'

const e = encodeURIComponent

/** 从后台加载文档树 */
function* loadTreeState(reload: boolean) {
  try {
    const res = yield fetch(`/api/list?reload=${reload ? 'true' : 'false'}`)
    if (res.ok) {
      const treeState: TreeState = yield res.json()
      yield put(loadData(treeState))
      if (reload) {
        yield put(toast('更新文档树信息成功'))
      }
    } else {
      yield put(toast(`Failed to load tree. ${res.status} ${res.statusText}`, Intent.DANGER))
    }
  } catch (e) {
    yield put(toast(`Failed to load tree. ${e.message}`, Intent.DANGER))
  }
}

function* handleRequestDiffColls({ docname, collNames }: Action.RequestDiffColls) {
  if (collNames.length < 2) {
    yield put(toast('请选择两个以上的标注文件', Intent.WARNING))
    return
  }
  yield put(toast('diff 功能仍在开发中', Intent.WARNING)) // TODO
  // const colls: RawColl[] = yield all(
  //   collNames.map(collName =>
  //     fetch(`/api/annotation-set/${e(docname)}/${e(collName)}`).then(res => res.json()),
  //   ),
  // )
  // const text = yield fetch(`/api/doc/${e(docname)}`).then(res => res.text())
  // diffColls(text, colls)
}

function* closeCurrentColl() {
  const { main, cache }: State = yield select()
  if (main.getStatus() === 'closed') {
    return
  }

  if (!is(cache.annotations, main.annotations)) {
    yield put(toast('关闭文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  // 清空缓存
  yield put(setCachedAnnotations(Map()))
  // 清空当前编辑器状态
  yield put(setMainState(new MainState()))
  // 清空历史记录
  yield put(historyClear())
}

/** 保存当前的标注工作进度 */
function* saveCurrentColl() {
  const { main, cache }: State = yield select()
  if (is(cache.annotations, main.annotations)) {
    return
  }

  const { docname, collName } = main
  try {
    const response = yield fetch(`/api/annotation-set/${e(docname)}/${e(collName)}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ annotations: main.annotations.valueSeq() }),
    })
    if (response.ok) {
      yield put(setCachedAnnotations(main.annotations))
      yield applyMainAction(
        new EmptyMainAction('保存文件').withCategory(ActionCategory.sideEffects),
      )
      yield put(toast('Saved'))
    } else {
      throw new Error('response not ok')
    }
  } catch (e) {
    console.error(e)
    yield put(toast(e.message, Intent.DANGER))
  }
}

function* handleRequestOpenDocStat({ docname }: Action.RequestOpenDocStat) {
  const { main, cache }: State = yield select()

  if (main.getStatus() === 'coll' && !is(cache.annotations, main.annotations)) {
    yield put(toast('打开统计信息之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  try {
    const res: Response = yield fetch(`/api/doc-stat/${e(docname)}`)
    if (res.ok) {
      const { stat } = yield res.json()
      const mainState = new MainState({
        docname,
        collName: DOC_STAT_NAME,
        blocks: List(),
        range: null,
      })
      yield put(setMainState(mainState))
      // TODO 还需要 UPDATE_DOC_STAT
      yield put(
        updateDocStat(
          () =>
            new DocStatState({
              docname,
              stat: List(stat),
            }),
        ),
      )
      yield put(historyClear())
      yield applyMainAction(
        new EmptyMainAction(`打开文档 ${docname} 的统计信息`).withCategory(
          ActionCategory.sideEffects,
        ),
      )
    } else {
      throw new Error(`${res.status} ${res.statusText}`)
    }
  } catch (e) {
    console.error(e)
    yield put(toast(e.message, Intent.DANGER))
  }
}

function* handleRequestOpenColl({ docname, collName }: Action.RequestOpenColl) {
  const collector = yield getContext('collector')
  const { main, cache }: State = yield select()
  if (main.getStatus() === 'coll' && !is(cache.annotations, main.annotations)) {
    yield put(toast('打开文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  try {
    const docRes = yield fetch(`/api/doc/${e(docname)}`)
    if (docRes.ok) {
      const blocks = yield docRes.json()
      const collRes = yield fetch(`/api/annotation-set/${e(docname)}/${e(collName)}`)
      if (collRes.ok) {
        const json = yield collRes.json()
        const annotations: Map<string, Annotation> = keyed(
          Seq(json.annotations).map(Annotation.fromJS),
        )
        const mainState = new MainState({
          docname,
          collName,
          blocks: List(blocks),
          annotations,
          range: null,
          // TODO hints & slots
        })

        updateAnnotationNextId(annotations)
        collector.collOpened(docname, collName)
        yield put(setMainState(mainState))
        yield put(setCachedAnnotations(mainState.annotations))
        yield put(historyClear())
        yield applyMainAction(
          new EmptyMainAction(`打开文件 ${docname} - ${collName}`).withCategory(
            ActionCategory.sideEffects,
          ),
        )
      } else {
        throw new Error(`${collRes.status} ${collRes.statusText}`)
      }
    } else {
      throw new Error(`${docRes.status} ${docRes.statusText}`)
    }
  } catch (e) {
    console.error(e)
    yield put(toast(e.message, Intent.DANGER))
  }
}

function getNextCollName(doc: TreeDoc, username: string) {
  const prefix = username ? `${username}-` : 'anonymous-'
  let i = 1
  while (true) {
    const name = prefix + i
    if (!doc.annotations.includes(name)) {
      break
    }
    i++
  }
  return prefix + i
}

function* handleRequestAddColl({ docname }: Action.RequestAddColl) {
  const {
    misc: { username },
    tree,
    main,
    cache,
  }: State = yield select()
  if (!is(main.annotations, cache.annotations)) {
    yield put(toast('创建新文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }
  const doc = tree.docs.find(doc => doc.name === docname)
  console.assert(doc != null)
  const collName = getNextCollName(doc, username)

  try {
    const res = yield fetch(`/api/annotation-set/${e(docname)}/${e(collName)}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ annotations: [] }),
    })
    if (res.ok) {
      yield loadTreeState(false)
      yield put(toast(`Created ${collName}`))
      yield put(requestOpenColl(doc.name, collName))
    } else {
      throw new Error(`${res.status} ${res.statusText})`)
    }
  } catch (e) {
    console.error(e)
    yield put(toast(e.message, Intent.DANGER))
  }
}

function* handleRequestDeleteColl({ docname, collName }: Action.RequestDeleteColl) {
  const { main }: State = yield select()
  if (main.docname === docname && collName === main.collName) {
    yield put(toast('不能删除当前打开的文件'))
    return
  }

  if (!window.confirm(`确认要删除 ${docname}-${collName} 吗？`)) {
    return
  }

  try {
    const response = yield fetch(`/api/annotation-set/${e(docname)}/${e(collName)}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      yield loadTreeState(false)
      yield put(toast(`Deleted. ${docname}/${collName}.`))
    } else {
      throw new Error('response not ok')
    }
  } catch (e) {
    console.error(e)
    yield put(toast(e.message, Intent.DANGER))
  }
}

export default function* fileSaga() {
  yield takeEvery(a('REQUEST_DIFF_COLLS'), handleRequestDiffColls)
  yield takeEvery(a('REQUEST_ADD_COLL'), handleRequestAddColl)
  yield takeEvery(a('REQUEST_DELETE_COLL'), handleRequestDeleteColl)
  yield takeEvery(a('REQUEST_CLOSE_CURRENT_COLL'), closeCurrentColl)
  yield takeEvery(a('REQUEST_SAVE_CURRENT_COLL'), saveCurrentColl)
  yield takeEvery(a('REQUEST_OPEN_DOC_STAT'), handleRequestOpenDocStat)
  yield takeEvery(a('REQUEST_OPEN_COLL'), handleRequestOpenColl)

  yield takeLatest(a('REQUEST_LOAD_TREE'), ({ reload }: Action.RequestLoadTree) =>
    loadTreeState(reload),
  )

  yield put(requestLoadTree(true))
}
