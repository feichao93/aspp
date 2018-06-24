import { Intent } from '@blueprintjs/core'
import { is, List, Map, Seq } from 'immutable'
import { getContext, put, select, takeEvery, takeLatest } from 'little-saga/compat'
import { ActionCategory } from '../actions/EditorAction'
import EmptyEditorAction from '../actions/EmptyEditorAction'
import { State } from '../reducers'
import { setCachedAnnotations } from '../reducers/cacheReducer'
import { DocStatState, setDocStat } from '../reducers/docStatReducer'
import { setEditorState } from '../reducers/editorReducer'
import { setFileInfo } from '../reducers/fileInfoReducer'
import { TreeDirectory, TreeDoc, TreeItem } from '../reducers/treeReducer'
import Annotation from '../types/Annotation'
import EditorState from '../types/EditorState'
import FileInfo from '../types/FileInfo'
import Action from '../utils/actions'
import { a, keyed, updateAnnotationNextId } from '../utils/common'
import InteractionCollector from '../utils/InteractionCollector'
import server from '../utils/server'
import { applyEditorAction } from './historyManager'

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

function* diffColls({ docname, collnames }: Action.RequestDiffColls) {
  if (collnames.length < 2) {
    yield put(Action.toast('请选择两个以上的标注文件', Intent.WARNING))
    return
  }
  yield put(Action.toast('diff 功能仍在开发中', Intent.WARNING))
  // TODO WIP
  // const colls: RawColl[] = yield all(
  //   collnames.map(collname =>
  //     fetch(`/api/annotation-set/${e(docname)}/${e(collname)}`).then(res => res.json()),
  //   ),
  // )
  // const text = yield fetch(`/api/doc/${e(docname)}`).then(res => res.text())
  // diffColls(text, colls)
}

function* closeCurrentColl() {
  const { editor, cache }: State = yield select()

  if (!is(cache.annotations, editor.annotations)) {
    yield put(Action.toast('关闭文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  // 清空缓存
  yield put(setCachedAnnotations(Map()))
  // 清空当前编辑器状态
  yield put(setEditorState(new EditorState()))
  // 清空当前打开文件信息
  yield put(setFileInfo(new FileInfo()))
  // 清空历史记录
  yield put(Action.historyClear())
}

/** 保存当前的标注工作进度 */
function* saveCurrentColl() {
  const { fileInfo, editor, cache }: State = yield select()
  if (is(cache.annotations, editor.annotations)) {
    return
  }

  try {
    yield server.putColl(fileInfo, {
      annotations: editor.annotations.valueSeq().toArray(),
    })
    yield put(setCachedAnnotations(editor.annotations))
    yield applyEditorAction(
      new EmptyEditorAction('保存文件').withCategory(ActionCategory.sideEffects),
    )
    yield put(Action.toast('保存成功'))
  } catch (e) {
    console.error(e)
    yield put(Action.toast(e.message, Intent.DANGER))
  }
}

function* openDocStat({ fileInfo: opening }: Action.RequestOpenDocStat) {
  const { fileInfo: cntFileInfo, editor, cache }: State = yield select()

  if (cntFileInfo.getType() === 'coll' && !is(cache.annotations, editor.annotations)) {
    yield put(Action.toast('打开统计信息之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  try {
    const statItems = yield server.getDocStat(opening)

    const docStat = new DocStatState({
      docname: opening.docname,
      items: List(statItems),
    })
    yield put(setDocStat(docStat))
    yield put(setFileInfo(opening))
    yield put(Action.historyClear())
    yield applyEditorAction(
      new EmptyEditorAction(`打开文档 ${opening.docname} 的统计信息`).withCategory(
        ActionCategory.sideEffects,
      ),
    )
  } catch (e) {
    console.error(e)
    yield put(Action.toast(e.message, Intent.DANGER))
  }
}

function* openColl({ fileInfo: opening }: Action.RequestOpenColl) {
  const collector: InteractionCollector = yield getContext('collector')
  const { fileInfo: cntFileInfo, editor, cache }: State = yield select()
  if (cntFileInfo.getType() === 'coll' && !is(cache.annotations, editor.annotations)) {
    yield put(Action.toast('打开文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  try {
    const blocks: string[] = yield server.getDoc(opening)
    const coll = yield server.getColl(opening)

    const annotations = keyed<Annotation>(Seq(coll.annotations).map(Annotation.fromJS))
    const editorState = new EditorState({
      blocks: List(blocks),
      annotations,
      range: null,
      // TODO hints & slots
    })

    updateAnnotationNextId(annotations)
    collector.collOpened(opening)
    yield put(setEditorState(editorState))
    yield put(setCachedAnnotations(editorState.annotations))
    yield put(setFileInfo(opening))
    yield put(Action.historyClear())
    yield applyEditorAction(
      new EmptyEditorAction(`打开文件 ${opening.docname} - ${opening.collname}`).withCategory(
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

function* addColl({ fileInfo }: Action.RequestAddColl) {
  if (DEV.ASSERT) {
    console.assert(fileInfo.getType() === 'doc')
  }
  const { config, tree, editor, cache }: State = yield select()
  if (!is(editor.annotations, cache.annotations)) {
    yield put(Action.toast('创建新文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  const doc = findDocInItems(tree, fileInfo)
  if (DEV.ASSERT) {
    console.assert(doc != null)
  }
  const collname = getNextCollname(doc, config.username)

  try {
    const adding = fileInfo.set('collname', collname)
    yield server.putColl(adding, { annotations: [] })
    yield loadTreeState(false)
    yield put(Action.toast(`已添加 ${collname}`))
    yield put(Action.requestOpenColl(adding))
  } catch (e) {
    console.error(e)
    yield put(Action.toast(e.message, Intent.DANGER))
  }
}

function* deleteColl({ fileInfo: deleting }: Action.RequestDeleteColl) {
  const { fileInfo: cntFileInfo }: State = yield select()
  if (is(deleting, cntFileInfo)) {
    yield put(Action.toast('不能删除当前打开的文件'))
    return
  }

  if (!window.confirm(`确认要删除 ${deleting.getFullName()} 吗？`)) {
    return
  }

  try {
    yield server.deleteColl(deleting)
    yield loadTreeState(false)
    yield put(Action.toast(`已删除 ${deleting.getFullName()}`))
  } catch (e) {
    console.error(e)
    yield put(Action.toast(e.message, Intent.DANGER))
  }
}

export default function* fileSaga() {
  yield takeEvery(a('REQUEST_DIFF_COLLS'), diffColls)
  yield takeEvery(a('REQUEST_ADD_COLL'), addColl)
  yield takeEvery(a('REQUEST_DELETE_COLL'), deleteColl)
  yield takeEvery(a('REQUEST_CLOSE_CURRENT_COLL'), closeCurrentColl)
  yield takeEvery(a('REQUEST_SAVE_CURRENT_COLL'), saveCurrentColl)
  yield takeEvery(a('REQUEST_OPEN_DOC_STAT'), openDocStat)
  yield takeEvery(a('REQUEST_OPEN_COLL'), openColl)

  yield takeLatest(a('REQUEST_LOAD_TREE'), ({ reload }: Action.RequestLoadTree) =>
    loadTreeState(reload),
  )

  yield put(Action.requestLoadTree(true))
}
