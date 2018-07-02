import { Intent } from '@blueprintjs/core'
import { is, List, Map as IMap, Seq } from 'immutable'
import { getContext, io, takeEvery, takeLatest } from 'little-saga/compat'
import React from 'react'
import { ActionCategory } from '../actions/EditorAction'
import EmptyEditorAction from '../actions/EmptyEditorAction'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import { setCachedAnnotations } from '../reducers/cacheReducer'
import { DocStatState, setDocStat } from '../reducers/docStatReducer'
import { setEditorState } from '../reducers/editorReducer'
import { setFileInfo } from '../reducers/fileInfoReducer'
import { TreeDirectory, TreeDoc, TreeItem } from '../reducers/treeReducer'
import Annotation from '../types/Annotation'
import { Slot } from '../types/Decoration'
import EditorState from '../types/EditorState'
import FileInfo from '../types/FileInfo'
import Action from '../utils/actions'
import calculateDiffs from '../utils/calculateDiffs'
import { a, keyed, updateAnnotationNextId, zip } from '../utils/common'
import getDiffSlots from '../utils/getDiffSlots'
import InteractionCollector from '../utils/InteractionCollector'
import server, { RawColl } from '../utils/server'
import { confirmDialogSaga, promptDialogSaga } from './dialogSaga'
import { applyEditorAction } from './historyManager'

/** 从后台加载文件树 */
export function* loadTreeState(reload: boolean) {
  try {
    const res = yield fetch(`/api/list?${reload ? 'reload' : ''}`)
    if (res.ok) {
      const treeState: TreeItem[] = yield res.json()
      yield io.put(Action.loadTreeData(treeState))
      if (reload) {
        yield io.put(Action.toast('更新文件树信息成功'))
      }
    } else {
      yield io.put(
        Action.toast(`Failed to load tree. ${res.status} ${res.statusText}`, Intent.DANGER),
      )
    }
  } catch (e) {
    yield io.put(Action.toast(`Failed to load tree. ${e.message}`, Intent.DANGER))
  }
}

function* diffColls({ docFileInfo, collnames }: Action.ReqDiffColls) {
  if (collnames.length < 2) {
    yield io.put(Action.toast('请选择两个以上的标注文件', Intent.WARNING))
    return
  }
  try {
    const colls: RawColl[] = yield io.all(
      collnames.map(collname => server.getColl(docFileInfo.set('collname', collname))),
    )
    const diffs = calculateDiffs(zip(collnames, colls))
    const diffSlots = getDiffSlots(diffs)
    const diffCollname = `diff---${collnames.join('__')}`
    const diffFileInfo = docFileInfo.set('collname', diffCollname)
    const diffColl: RawColl = { name: diffCollname, annotations: [], slots: diffSlots }

    yield server.putColl(diffFileInfo, diffColl)
    yield loadTreeState(false)

    yield io.put(Action.toast(`已生成 ${diffFileInfo.collname}`))
    yield io.put(Action.reqOpenColl(diffFileInfo))
  } catch (e) {
    yield io.put(Action.toast(e.message, Intent.DANGER))
  }
}

function* reqCloseCurrentColl() {
  const { editor, cache }: State = yield io.select()

  if (!is(cache.annotations, editor.annotations)) {
    yield io.put(Action.toast('关闭文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  yield closeCurrentColl()
}

function* closeCurrentColl() {
  // 清空缓存
  yield io.put(setCachedAnnotations(IMap()))
  // 清空当前编辑器状态
  yield io.put(setEditorState(new EditorState()))
  // 清空当前打开文件信息
  yield io.put(setFileInfo(new FileInfo()))
  // 清空历史记录
  yield io.put(Action.historyClear())
}

/** 保存当前的标注工作进度 */
function* saveCurrentColl() {
  const { fileInfo, editor, cache }: State = yield io.select()
  if (is(cache.annotations, editor.annotations)) {
    return
  }

  try {
    yield server.putColl(fileInfo, editor.toRawColl(fileInfo.collname))
    yield io.put(setCachedAnnotations(editor.annotations))
    yield applyEditorAction(
      new EmptyEditorAction('保存文件').withCategory(ActionCategory.sideEffects),
    )
    yield io.put(Action.toast('保存成功'))
  } catch (e) {
    console.error(e)
    yield io.put(Action.toast(e.message, Intent.DANGER))
  }
}

function* openDocStat({ fileInfo: opening }: Action.ReqOpenDocStat) {
  const { fileInfo: cntFileInfo, editor, cache }: State = yield io.select()

  if (cntFileInfo.getType() === 'coll' && !is(cache.annotations, editor.annotations)) {
    yield io.put(Action.toast('打开统计信息之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  try {
    const statItems = yield server.getDocStat(opening)

    const docStat = new DocStatState({
      docname: opening.docname,
      items: List(statItems),
    })
    yield io.put(setDocStat(docStat))
    yield io.put(setFileInfo(opening))
    yield io.put(Action.historyClear())
    yield io.put(setEditorState(new EditorState()))
    yield applyEditorAction(
      new EmptyEditorAction(`打开文档 ${opening.docname} 的统计信息`).withCategory(
        ActionCategory.sideEffects,
      ),
    )
  } catch (e) {
    console.error(e)
    yield io.put(Action.toast(e.message, Intent.DANGER))
  }
}

function* openColl({ fileInfo: opening }: Action.ReqOpenColl) {
  const collector: InteractionCollector = yield getContext('collector')
  const { fileInfo: cntFileInfo, editor, cache }: State = yield io.select()
  if (cntFileInfo.getType() === 'coll' && !is(cache.annotations, editor.annotations)) {
    yield io.put(Action.toast('打开文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  try {
    const blocks: string[] = yield server.getDoc(opening)
    const coll: RawColl = yield server.getColl(opening)

    const annotations = keyed<Annotation>(Seq(coll.annotations).map(Annotation.fromJS))
    const slots = keyed<Slot>(Seq(coll.slots).map(Slot.fromJS))
    const editorState = new EditorState({
      blocks: List(blocks),
      annotations,
      range: null,
      slots,
    })

    updateAnnotationNextId(annotations)
    collector.collOpened(opening)
    yield io.put(setEditorState(editorState))
    yield io.put(setCachedAnnotations(editorState.annotations))
    yield io.put(setFileInfo(opening))
    yield io.put(Action.historyClear())
    yield applyEditorAction(
      new EmptyEditorAction(`打开文件 ${opening.docname} - ${opening.collname}`).withCategory(
        ActionCategory.sideEffects,
      ),
    )
  } catch (e) {
    console.error(e)
    yield io.put(Action.toast(e.message, Intent.DANGER))
  }
}

function getNextCollname(doc: TreeDoc, prefix: string) {
  const finalPrefix = prefix ? `${prefix}-` : 'anonymous-'
  let i = 1
  while (true) {
    const name = finalPrefix + i
    if (!doc.collnames.includes(name)) {
      break
    }
    i++
  }
  return finalPrefix + i
}

function findDocInItems(items: TreeItem[], fileInfo: FileInfo): TreeDoc {
  for (const dirname of fileInfo.docPath) {
    const subDir = items.find(
      item => item.type === 'directory' && item.name === dirname,
    ) as TreeDirectory
    if (DEV_ASSERT) {
      console.assert(subDir != null)
    }
    items = subDir.items
  }
  return items.find(item => item.type === 'doc' && item.name === fileInfo.docname) as TreeDoc
}

function* addColl({ fileInfo }: Action.ReqAddColl) {
  if (DEV_ASSERT) {
    console.assert(fileInfo.getType() === 'doc')
  }
  const { config, tree, editor, cache }: State = yield io.select()
  if (!is(editor.annotations, cache.annotations)) {
    yield io.put(Action.toast('创建新文件之前请先保存或丢弃当前更改', Intent.WARNING))
    return
  }

  const doc = findDocInItems(tree, fileInfo)
  if (DEV_ASSERT) {
    console.assert(doc != null)
  }
  const collname = getNextCollname(doc, config.username)

  try {
    const adding = fileInfo.set('collname', collname)
    const emptyColl: RawColl = { name: collname, slots: [], annotations: [] }
    yield server.putColl(adding, emptyColl)
    yield loadTreeState(false)
    yield io.put(Action.toast(`已添加 ${collname}`))
    yield io.put(Action.reqOpenColl(adding))
  } catch (e) {
    console.error(e)
    yield io.put(Action.toast(e.message, Intent.DANGER))
  }
}

function* duplicateColl({ fileInfo }: Action.ReqDuplicateColl) {
  if (DEV_ASSERT) {
    console.assert(fileInfo.getType() === 'coll')
  }
  const { editor, cache, fileInfo: cntFileInfo, tree, config }: State = yield io.select()
  if (is(cntFileInfo, fileInfo) && !is(editor.annotations, cache.annotations)) {
    const result = yield confirmDialogSaga('当前文件的未保存标注内容不会被复制，是否继续?')
    if (!result) { return }
  }
  const doc = findDocInItems(tree, fileInfo)
  if (DEV_ASSERT) {
    console.assert(doc != null)
  }
  const duplicateCollname = getNextCollname(doc, fileInfo.collname + '-duplicate')
  try {
    const currentColl = yield server.getColl(fileInfo)
    const duplicating = fileInfo.set('collname', duplicateCollname)
    yield server.putColl(duplicating, currentColl)
    yield loadTreeState(false)
    yield io.put(Action.toast(`已复制 ${duplicating.collname}`))
  } catch (e) {
    console.error(e)
    yield io.put(Action.toast(e.message, Intent.DANGER))
  }
}
function* deleteColl({ fileInfo: deleting }: Action.ReqDeleteColl) {
  const { fileInfo: cntFileInfo }: State = yield io.select()

  const confirmed = yield confirmDialogSaga(
    <span>确认要删除 {Rich.number(deleting.getFullName())} 吗？</span>,
  )
  if (!confirmed) {
    return
  }

  if (is(deleting, cntFileInfo)) {
    yield closeCurrentColl()
  }

  try {
    yield server.deleteColl(deleting)
    yield loadTreeState(false)
    yield io.put(Action.toast(`已删除 ${deleting.getFullName()}`))
  } catch (e) {
    console.error(e)
    yield io.put(Action.toast(e.message, Intent.DANGER))
  }
}

function* renameColl({ fileInfo: renaming }: Action.ReqRenameColl) {
  const { fileInfo: cntFileInfo, tree }: State = yield io.select()
  const treeDoc = findDocInItems(tree, renaming.set('collname', ''))
  if (is(renaming, cntFileInfo)) {
    yield io.put(Action.toast('暂时不支持重命名当前打开的文件', Intent.WARNING))
    return
  }
  try {
    const newName = yield promptDialogSaga('请输入新的文件名')
    if (newName == null || newName === renaming.collname) {
      return
    }
    if (!/^[a-zA-Z0-9\-_\u4e00-\u9fa5]+$/.test(newName)) {
      yield io.put(Action.toast('文件名无效'))
      return
    }
    if (newName.length === 0) {
      yield io.put(Action.toast('文件名不能为空'))
      return
    }
    if (newName !== renaming.collname && treeDoc.collnames.includes(newName)) {
      yield io.put(Action.toast('已存在同名标注文件'))
      return
    }
    yield server.renameColl(renaming, newName)
    yield loadTreeState(false)
    yield io.put(Action.toast('修改成功'))
  } catch (e) {
    console.error(e)
    yield io.put(Action.toast(e.message, Intent.DANGER))
  }
}

export default function* fileSaga() {
  yield takeEvery(a('REQ_DIFF_COLLS'), diffColls)
  yield takeEvery(a('REQ_ADD_COLL'), addColl)
  yield takeEvery(a('REQ_DELETE_COLL'), deleteColl)
  yield takeEvery(a('REQ_CLOSE_CURRENT_COLL'), reqCloseCurrentColl)
  yield takeEvery(a('REQ_SAVE_CURRENT_COLL'), saveCurrentColl)
  yield takeEvery(a('REQ_OPEN_DOC_STAT'), openDocStat)
  yield takeEvery(a('REQ_OPEN_COLL'), openColl)
  yield takeEvery(a('REQ_RENAME_COLL'), renameColl)
  yield takeEvery(a('REQ_DUPLICATE_COLL'), duplicateColl)
  yield takeLatest(a('REQ_LOAD_TREE'), ({ reload }: Action.ReqLoadTree) => loadTreeState(reload))

  yield io.put(Action.reqLoadTree(true))
}
