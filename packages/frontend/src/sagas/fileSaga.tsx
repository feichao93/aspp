import { Intent } from '@blueprintjs/core'
import { is, List, Seq } from 'immutable'
import { io, takeEvery, takeLatest } from 'little-saga'
import React from 'react'
import { ActionCategory } from '../actions/EditorAction'
import EmptyEditorAction from '../actions/EmptyEditorAction'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import { CacheState } from '../reducers/cacheReducer'
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
import * as selectors from '../utils/selectors'
import server, { RawColl } from '../utils/server'
import * as cacheManager from './cacheManager'
import { confirmDialogSaga, promptDialogSaga, selectDialogSaga } from './dialogSaga'
import { applyEditorAction } from './historyManager'
import toaster from './toaster'

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
    const diffColl: RawColl = { annotations: [], slots: diffSlots }

    yield server.putColl(diffFileInfo, diffColl)
    yield loadTreeState(false)

    yield io.put(Action.toast(`已生成 ${diffFileInfo.collname}`))
    yield io.put(Action.reqOpenColl(diffFileInfo))
  } catch (e) {
    yield io.put(Action.toast(e.message, Intent.DANGER))
  }
}

export function* reqCloseCurrentColl() {
  const { fileInfo }: State = yield io.select()

  if (yield io.select(selectors.hasUnsavedChanges)) {
    const selected = yield selectDialogSaga(
      <span>关闭 {Rich.number(fileInfo.getFullName())} 之前是否要保存当前的修改？</span>,
      [
        { option: '保存', intent: Intent.PRIMARY },
        { option: '不保存', intent: Intent.DANGER },
        '取消',
      ],
    )
    if (selected === '取消') {
      return
    }
    if (selected === '保存') {
      yield saveCurrentColl()
    }
  }
  yield closeCurrentColl()
}

export function* closeCurrentColl() {
  // 清空缓存
  yield cacheManager.invalidateCacheSaga()
  // 清空当前编辑器状态
  yield io.put(setEditorState(new EditorState()))
  // 清空当前打开文件信息
  yield io.put(setFileInfo(new FileInfo()))
  // 清空历史记录
  yield io.put(Action.historyClear())
  // 收集交互信息
  const collector: InteractionCollector = yield io.getContext('collector')
  collector.collClosed()
}

/** 保存当前的标注工作进度 */
function* saveCurrentColl() {
  const { fileInfo, editor, cache }: State = yield io.select()
  if (is(new CacheState(editor), cache)) {
    return
  }

  try {
    yield server.putColl(fileInfo, editor.toRawColl())
    yield cacheManager.updateCacheSaga()
    yield applyEditorAction(
      new EmptyEditorAction('保存文件').withCategory(ActionCategory.sideEffects),
    )
    toaster.show({ message: '保存成功', intent: Intent.SUCCESS })
  } catch (e) {
    console.error(e)
    yield io.put(Action.toast(e.message, Intent.DANGER))
  }
}

function* openDocStat({ fileInfo: opening }: Action.ReqOpenDocStat) {
  if (yield io.select(selectors.hasUnsavedChanges)) {
    const selected = yield selectDialogSaga(<span>是否要保存对当前文件的修改？</span>, [
      { option: '保存', intent: Intent.PRIMARY },
      { option: '不保存', intent: Intent.DANGER },
      '取消',
    ])
    if (selected === '取消') {
      return
    }
    if (selected === '保存') {
      yield saveCurrentColl()
    }
  }
  yield closeCurrentColl()

  try {
    const statItems = yield server.getDocStat(opening)

    const docStat = new DocStatState({
      docname: opening.docname,
      items: List(statItems),
    })
    yield io.put(setDocStat(docStat))
    yield io.put(setFileInfo(opening))
    yield applyEditorAction(
      new EmptyEditorAction(`打开文档 ${opening.docname} 的统计信息`).withCategory(
        ActionCategory.sideEffects,
      ),
    )
  } catch (e) {
    console.error(e)
    toaster.show({ message: e.message, intent: Intent.DANGER })
  }
}

export function* openColl({ fileInfo: opening }: Action.ReqOpenColl) {
  const collector: InteractionCollector = yield io.getContext('collector')
  if (yield io.select(selectors.hasUnsavedChanges)) {
    const selected = yield selectDialogSaga(<span>是否要保存对当前文件的修改？</span>, [
      { option: '保存', intent: Intent.PRIMARY },
      { option: '不保存', intent: Intent.DANGER },
      '取消',
    ])
    if (selected === '取消') {
      return
    }
    if (selected === '保存') {
      yield saveCurrentColl()
    }
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
    yield cacheManager.updateCacheSaga()
    yield io.put(setFileInfo(opening))
    yield io.put(Action.historyClear())
    yield applyEditorAction(
      new EmptyEditorAction(`打开文件 ${opening.docname} - ${opening.collname}`).withCategory(
        ActionCategory.sideEffects,
      ),
    )
    toaster.show({ message: `已打开 ${opening.collname}`, intent: Intent.PRIMARY })
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

  if (yield io.select(selectors.hasUnsavedChanges)) {
    const selected = yield selectDialogSaga(<span>是否要保存对当前文件的修改？</span>, [
      { option: '保存', intent: Intent.PRIMARY },
      { option: '不保存', intent: Intent.DANGER },
      '取消',
    ])
    if (selected === '取消') {
      return
    }
    if (selected === '保存') {
      yield saveCurrentColl()
    }
  }
  // 无论上述选择如何，都需要重新设置缓存
  // yield cacheManager.updateCacheSaga()
  yield closeCurrentColl()

  const { config, tree }: State = yield io.select()

  const doc = findDocInItems(tree, fileInfo)
  if (DEV_ASSERT) {
    console.assert(doc != null)
  }
  const collname = getNextCollname(doc, config.username)

  try {
    const adding = fileInfo.set('collname', collname)
    const emptyColl: RawColl = { slots: [], annotations: [] }
    yield server.putColl(adding, emptyColl)
    yield loadTreeState(false)
    yield io.put(Action.toast(`已添加 ${collname}`, Intent.SUCCESS))
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
  if (yield io.select(selectors.hasUnsavedChanges)) {
    const result = yield confirmDialogSaga('当前文件的未保存标注内容不会被复制，是否继续?')
    if (!result) {
      return
    }
  }
  const { tree }: State = yield io.select()
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
    toaster.show({ message: `已删除 ${deleting.getFullName()}`, intent: Intent.PRIMARY })
  } catch (e) {
    console.error(e)
    toaster.show({ message: e.message, intent: Intent.DANGER })
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
