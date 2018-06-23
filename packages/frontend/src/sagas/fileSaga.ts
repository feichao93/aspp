import { Intent } from '@blueprintjs/core'
import { is, List, Map, Seq } from 'immutable'
import { getContext, put, select, takeEvery, takeLatest } from 'little-saga/compat'
import EmptyMainAction from '../actions/EmptyMainAction'
import { ActionCategory } from '../actions/MainAction'
import { State } from '../reducers'
import { setCachedAnnotations } from '../reducers/cacheReducer'
import { DocStatState, updateDocStat } from '../reducers/docStatReducer'
import { TreeDirectory, TreeDoc, TreeItem } from '../reducers/treeReducer'
import Annotation from '../types/Annotation'
import FileInfo from '../types/FileInfo'
import MainState from '../types/MainState'
import Action from '../utils/actions'
import { a, keyed, updateAnnotationNextId } from '../utils/common'
import { DOC_STAT_NAME } from '../utils/constants'
import server from '../utils/server'
import { applyMainAction } from './historyManager'

/** 从后台加载文档树 */
function* loadTreeState(reload: boolean) {
  try {
    const res = yield fetch(`/api/list?${reload ? 'reload' : ''}`)
    if (res.ok) {
      const treeState: TreeItem[] = yield res.json()
      yield put(Action.loadTreeData(treeState))
      if (reload) {
        yield put(Action.toast('更新文档树信息成功'))
      }
    } else {
      yield put(Action.toast(`Failed to load tree. ${res.status} ${res.statusText}`, Intent.DANGER))
    }
  } catch (e) {
    yield put(Action.toast(`Failed to load tree. ${e.message}`, Intent.DANGER))
  }
}

function* handleRequestDiffColls({ docname, collNames }: Action.RequestDiffColls) {
  if (collNames.length < 2) {
    yield put(Action.toast('请选择两个以上的标注文件', Intent.WARNING))
    return
  }
  yield put(Action.toast('diff 功能仍在开发中', Intent.WARNING)) // TODO
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
    yield put(Action.toast('关闭文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  // 清空缓存
  yield put(setCachedAnnotations(Map()))
  // 清空当前编辑器状态
  yield put(Action.setMainState(new MainState()))
  // 清空历史记录
  yield put(Action.historyClear())
}

// TODO 去掉该函数
function findDocInItemsStupidly(rootItems: TreeItem[], docname: string) {
  return dfs(List(), rootItems)

  function dfs(docPath: List<string>, items: TreeItem[]): List<string> {
    for (const item of items) {
      if (item.type === 'doc') {
        if (item.name === docname) {
          return docPath
        }
      } else {
        const subResult = dfs(docPath.push(item.name), item.items)
        if (subResult) {
          return subResult
        }
      }
    }
    return null
  }
}

/** 保存当前的标注工作进度 */
function* saveCurrentColl() {
  const { main, cache, tree }: State = yield select()
  if (is(cache.annotations, main.annotations)) {
    return
  }

  const { docname, collName } = main
  const docPath = findDocInItemsStupidly(tree, docname)
  const fileInfo = new FileInfo({ docPath, docname, collName })
  try {
    yield server.putColl(fileInfo, {
      annotations: main.annotations.valueSeq().toArray(),
    })
    yield put(setCachedAnnotations(main.annotations))
    yield applyMainAction(new EmptyMainAction('保存文件').withCategory(ActionCategory.sideEffects))
    yield put(Action.toast('保存成功'))
  } catch (e) {
    console.error(e)
    yield put(Action.toast(e.message, Intent.DANGER))
  }
}

function* handleRequestOpenDocStat({ fileInfo }: Action.RequestOpenDocStat) {
  const { main, cache }: State = yield select()

  if (main.getStatus() === 'coll' && !is(cache.annotations, main.annotations)) {
    yield put(Action.toast('打开统计信息之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  try {
    const stat = yield server.getDocStat(fileInfo)
    const mainState = new MainState({
      docname: fileInfo.docname,
      collName: DOC_STAT_NAME,
      blocks: List(),
      range: null,
    })
    yield put(Action.setMainState(mainState))
    // TODO 还需要 UPDATE_DOC_STAT
    yield put(
      updateDocStat(
        () =>
          new DocStatState({
            docname: fileInfo.docname,
            stat: List(stat),
          }),
      ),
    )
    yield put(Action.historyClear())
    yield applyMainAction(
      new EmptyMainAction(`打开文档 ${fileInfo.docname} 的统计信息`).withCategory(
        ActionCategory.sideEffects,
      ),
    )
  } catch (e) {
    console.error(e)
    yield put(Action.toast(e.message, Intent.DANGER))
  }
}

function* handleRequestOpenColl({ fileInfo }: Action.RequestOpenColl) {
  const collector = yield getContext('collector')
  const { main, cache }: State = yield select()
  if (main.getStatus() === 'coll' && !is(cache.annotations, main.annotations)) {
    yield put(Action.toast('打开文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  try {
    const blocks: string[] = yield server.getDoc(fileInfo)
    const coll = yield server.getColl(fileInfo)

    const annotations = keyed<Annotation>(Seq(coll.annotations).map(Annotation.fromJS))
    const mainState = new MainState({
      docname: fileInfo.docname,
      collName: fileInfo.collName,
      blocks: List(blocks),
      annotations,
      range: null,
      // TODO hints & slots
    })

    updateAnnotationNextId(annotations)
    collector.collOpened(fileInfo.docname, fileInfo.collName)
    yield put(Action.setMainState(mainState))
    yield put(setCachedAnnotations(mainState.annotations))
    yield put(Action.historyClear())
    yield applyMainAction(
      new EmptyMainAction(`打开文件 ${fileInfo.docname} - ${fileInfo.collName}`).withCategory(
        ActionCategory.sideEffects,
      ),
    )
  } catch (e) {
    console.error(e)
    yield put(Action.toast(e.message, Intent.DANGER))
  }
}

function getNextCollname(doc: TreeDoc, username: string) {
  const prefix = username ? `${username}-` : 'anonymous-'
  let i = 1
  while (true) {
    const name = prefix + i
    if (!doc.collnames.includes(name)) {
      break
    }
    i++
  }
  return prefix + i
}

function findDocInItems(items: TreeItem[], fileInfo: FileInfo): TreeDoc {
  for (const dirname of fileInfo.docPath) {
    const subDir = items.find(
      item => item.type === 'directory' && item.name === dirname,
    ) as TreeDirectory
    if (DEV.ASSERT) {
      console.assert(subDir != null)
    }
    items = subDir.items
  }
  return items.find(item => item.type === 'doc' && item.name === fileInfo.docname) as TreeDoc
}

function* handleRequestAddColl({ fileInfo }: Action.RequestAddColl) {
  if (DEV.ASSERT) {
    console.assert(fileInfo.getType() === 'doc')
  }
  const { config, tree, main, cache }: State = yield select()
  if (!is(main.annotations, cache.annotations)) {
    yield put(Action.toast('创建新文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  const doc = findDocInItems(tree, fileInfo)
  if (DEV.ASSERT) {
    console.assert(doc != null)
  }
  const collName = getNextCollname(doc, config.username)

  try {
    const newCollInfo = fileInfo.set('collName', collName)
    yield server.putColl(newCollInfo, { annotations: [] })
    yield loadTreeState(false)
    yield put(Action.toast(`Created ${collName}`))
    yield put(Action.requestOpenColl(newCollInfo))
  } catch (e) {
    console.error(e)
    yield put(Action.toast(e.message, Intent.DANGER))
  }
}

function* handleRequestDeleteColl({ fileInfo }: Action.RequestDeleteColl) {
  const { docname, collName } = fileInfo
  const { main }: State = yield select()
  if (main.docname === docname && collName === main.collName) {
    yield put(Action.toast('不能删除当前打开的文件'))
    return
  }

  if (!window.confirm(`确认要删除 ${docname}-${collName} 吗？`)) {
    return
  }

  try {
    yield server.deleteColl(fileInfo)
    yield loadTreeState(false)
    yield put(Action.toast(`Deleted. ${docname}/${collName}.`))
  } catch (e) {
    console.error(e)
    yield put(Action.toast(e.message, Intent.DANGER))
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

  yield put(Action.requestLoadTree(true))
}
