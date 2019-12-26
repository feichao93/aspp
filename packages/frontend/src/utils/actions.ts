import { Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import EditorAction from '../actions/EditorAction'
import { DialogOption } from '../components/dialogs/SelectDialog'
import { CacheState } from '../reducers/cacheReducer'
import { DocStatState } from '../reducers/docStatReducer'
import { updateEditorState } from '../reducers/editorReducer'
import { TreeItem } from '../reducers/treeReducer'
import { TaskMap } from '../tasks'
import TaskConstructor from '../tasks/TaskConstructor'
import Decoration from '../types/Decoration'
import EditorState from '../types/EditorState'
import FileInfo from '../types/FileInfo'

type Action = Action.ALL

namespace Action {
  export type ALL =
    | MiscTypes
    | FileTypes
    | UserInteractionTypes
    | TaskTypes
    | StateUpdateTypes
    | HistoryTypes
    | UpdateClientsInfo

  // region MiscTypes
  type MiscTypes =
    | Toast
    | ToggleHelpOverlay
    | TogglePanelsVisibility
    | ToggleFileTreeVisibility
    | SetUsername
    | ReqSetUsername
    | ToggleTagVisibility
    | ShowConfirmDialog
    | SettleConfirmDialog
    | ShowPromptDialog
    | SettlePromptDialog
    | HideDialog
    | ShowSelectDialog
    | SettleSelectDialog
  /** @deprecated 请直接调用 toaster.show */
  export interface Toast {
    type: 'TOAST'
    message: string
    intent: Intent
  }
  /** @deprecated 请直接调用 toaster.show */
  export function toast(text: string, intent = Intent.NONE): Toast {
    return { type: 'TOAST', message: text, intent }
  }

  export function setActiveGroup(activeGroup: string): UpdateEditorState {
    return updateEditorState(editor => editor.set('activeGroup', activeGroup))
  }

  export interface ToggleHelpOverlay {
    type: 'TOGGLE_HELP_OVERLAY'
  }
  export function toggleHelpOverlay(): ToggleHelpOverlay {
    return { type: 'TOGGLE_HELP_OVERLAY' }
  }

  export interface TogglePanelsVisibility {
    type: 'TOGGLE_PANELS_VISIBILITY'
  }
  export function togglePanelsVisibility(): TogglePanelsVisibility {
    return { type: 'TOGGLE_PANELS_VISIBILITY' }
  }

  export interface ToggleFileTreeVisibility {
    type: 'TOGGLE_FILE_TREE_VISIBILITY'
  }
  export function toggleFileTreeVisibility(): ToggleFileTreeVisibility {
    return { type: 'TOGGLE_FILE_TREE_VISIBILITY' }
  }

  export interface SetUsername {
    type: 'SET_USERNAME'
    username: string
  }
  export function setUsername(username: string): SetUsername {
    return { type: 'SET_USERNAME', username }
  }

  export interface ReqSetUsername {
    type: 'REQ_SET_USERNAME'
  }
  export function reqSetUsername(): ReqSetUsername {
    return { type: 'REQ_SET_USERNAME' }
  }

  export interface ToggleTagVisibility {
    type: 'TOGGLE_TAG_VISIBILITY'
    tagName: string
  }
  export function toggleTagVisibility(tagName: string): ToggleTagVisibility {
    return { type: 'TOGGLE_TAG_VISIBILITY', tagName }
  }

  export interface HideDialog {
    type: 'HIDE_DIALOG'
  }
  export function hideDialog(): HideDialog {
    return { type: 'HIDE_DIALOG' }
  }
  export interface ShowSelectDialog {
    type: 'SHOW_SELECT_DIALOG'
    message: string | JSX.Element
    options: DialogOption[]
  }
  export function showSelectDialog(
    message: string | JSX.Element,
    options: DialogOption[],
  ): ShowSelectDialog {
    return { type: 'SHOW_SELECT_DIALOG', message, options }
  }
  export interface SettleSelectDialog {
    type: 'SETTLE_SELECT_DIALOG'
    selected: string
  }
  export function settleSelectDialog(option: string): SettleSelectDialog {
    return { type: 'SETTLE_SELECT_DIALOG', selected: option }
  }
  export interface ShowConfirmDialog {
    type: 'SHOW_CONFIRM_DIALOG'
    message: string | JSX.Element
  }
  export function showConfirmDialog(message: string | JSX.Element): ShowConfirmDialog {
    return { type: 'SHOW_CONFIRM_DIALOG', message }
  }

  export interface SettleConfirmDialog {
    type: 'SETTLE_CONFIRM_DIALOG'
    result: boolean
  }
  export function settleConfirmDialog(result: boolean): SettleConfirmDialog {
    return { type: 'SETTLE_CONFIRM_DIALOG', result }
  }

  export interface ShowPromptDialog {
    type: 'SHOW_PROMPT_DIALOG'
    message: string | JSX.Element
    defaultValue: string
  }
  export function showPromptDialog(
    message: string | JSX.Element,
    defaultValue: string,
  ): ShowPromptDialog {
    return { type: 'SHOW_PROMPT_DIALOG', message, defaultValue }
  }

  export interface SettlePromptDialog {
    type: 'SETTLE_PROMPT_DIALOG'
    value: string | null
  }
  export function settlePromptDialog(value: string | null): SettlePromptDialog {
    return { type: 'SETTLE_PROMPT_DIALOG', value }
  }

  export interface SetTagGroupVisibility {
    type: 'SET_TAG_GROUP_VISIBILITY'
    groupName: string
    visible: boolean
  }
  export function setTagGroupVisibility(
    groupName: string,
    visible: boolean,
  ): SetTagGroupVisibility {
    return { type: 'SET_TAG_GROUP_VISIBILITY', groupName, visible }
  }

  export interface UserReqRevert {
    type: 'USER_REQ_REVERT'
  }
  export function userReqRevert(): UserReqRevert {
    return { type: 'USER_REQ_REVERT' }
  }

  export interface UserReqUndo {
    type: 'USER_REQ_UNDO'
  }
  export function userReqUndo(): UserReqUndo {
    return { type: 'USER_REQ_UNDO' }
  }

  export interface UserReqRedo {
    type: 'USER_REQ_REDO'
  }
  export function userReqRedo(): UserReqRedo {
    return { type: 'USER_REQ_REDO' }
  }
  // endregion

  // region FileTypes
  type FileTypes =
    | ReqDiffColls
    | ReqLoadTree
    | LoadTreeState
    | ReqAddColl
    | ReqDeleteColl
    | ReqCloseCurrentColl
    | ReqSaveCurrentColl
    | ReqOpenDocStat
    | ReqOpenColl
    | ReqRenameColl
    | ReqDuplicateColl

  export interface ReqDiffColls {
    type: 'REQ_DIFF_COLLS'
    docFileInfo: FileInfo
    collnames: string[]
  }
  export function reqDiffColls(docFileInfo: FileInfo, collnames: string[]): ReqDiffColls {
    return { type: 'REQ_DIFF_COLLS', docFileInfo, collnames }
  }

  export interface ReqLoadTree {
    type: 'REQ_LOAD_TREE'
    reload: boolean
  }
  export function reqLoadTree(reload: boolean): ReqLoadTree {
    return { type: 'REQ_LOAD_TREE', reload }
  }

  export interface LoadTreeState {
    type: 'LOAD_TREE_STATE'
    treeState: TreeItem[]
  }
  export function loadTreeData(treeState: TreeItem[]): LoadTreeState {
    return { type: 'LOAD_TREE_STATE', treeState }
  }

  export interface ReqAddColl {
    type: 'REQ_ADD_COLL'
    fileInfo: FileInfo
  }
  export function reqAddColl(fileInfo: FileInfo): ReqAddColl {
    return { type: 'REQ_ADD_COLL', fileInfo }
  }

  export interface ReqDeleteColl {
    type: 'REQ_DELETE_COLL'
    fileInfo: FileInfo
  }
  export function reqDeleteColl(fileInfo: FileInfo): ReqDeleteColl {
    return { type: 'REQ_DELETE_COLL', fileInfo }
  }

  export interface ReqDuplicateColl {
    type: 'REQ_DUPLICATE_COLL'
    fileInfo: FileInfo
  }
  export function reqDuplicateColl(fileInfo: FileInfo): ReqDuplicateColl {
    return { type: 'REQ_DUPLICATE_COLL', fileInfo }
  }

  export interface ReqCloseCurrentColl {
    type: 'REQ_CLOSE_CURRENT_COLL'
  }
  export function reqCloseCurrentColl(): ReqCloseCurrentColl {
    return { type: 'REQ_CLOSE_CURRENT_COLL' }
  }

  export interface ReqSaveCurrentColl {
    type: 'REQ_SAVE_CURRENT_COLL'
  }
  export function reqSaveCurrentColl(): ReqSaveCurrentColl {
    return { type: 'REQ_SAVE_CURRENT_COLL' }
  }

  export interface ReqOpenDocStat {
    type: 'REQ_OPEN_DOC_STAT'
    fileInfo: FileInfo
  }
  export function reqOpenDocStat(fileInfo: FileInfo): ReqOpenDocStat {
    return { type: 'REQ_OPEN_DOC_STAT', fileInfo }
  }

  export interface ReqRenameColl {
    type: 'REQ_RENAME_COLL'
    fileInfo: FileInfo
  }
  export function reqRenameColl(fileInfo: FileInfo): ReqRenameColl {
    return { type: 'REQ_RENAME_COLL', fileInfo }
  }

  export interface ReqOpenColl {
    type: 'REQ_OPEN_COLL'
    fileInfo: FileInfo
  }
  export function reqOpenColl(fileInfo: FileInfo): ReqOpenColl {
    return { type: 'REQ_OPEN_COLL', fileInfo }
  }
  // endregion

  // region TaskTypes
  type TaskTypes = AddTask | DeleteTask | RunTask | StopTask

  export interface AddTask {
    type: 'ADD_TASK'
    impl: TaskConstructor
    options: any
  }
  export function addTask(impl: TaskConstructor, options: any): AddTask {
    return { type: 'ADD_TASK', impl, options }
  }

  export interface DeleteTask {
    type: 'DELETE_TASK'
    id: string
  }
  export function deleteTask(id: string): DeleteTask {
    return { type: 'DELETE_TASK', id }
  }

  export interface RunTask {
    type: 'RUN_TASK'
    id: string
  }
  export function runTask(id: string): RunTask {
    return { type: 'RUN_TASK', id }
  }

  export interface StopTask {
    type: 'STOP_TASK'
    id: string
  }
  export function stopTask(id: string): StopTask {
    return { type: 'STOP_TASK', id }
  }
  // endregion

  // region UserInteractionTypes
  type UserInteractionTypes =
    | UserSetSel
    | UserSelectCurrent
    | UserClearSel
    | UserAnnotateCurrent
    | UserDeleteCurrent
    | UserAcceptCurrent
    | UserSettleDiff
    | UserReqRedo
    | UserReqRevert
    | UserReqUndo
    | SetTagGroupVisibility
    | UserSelectBlockHints
    | UserSelectBlockText
    | UserClickDecoration

  export interface UserSelectBlockHints {
    type: 'USER_SELECT_BLOCK_HINTS'
    blockIndex: number
  }
  export function userSelectBlockHints(blockIndex: number): UserSelectBlockHints {
    return { type: 'USER_SELECT_BLOCK_HINTS', blockIndex }
  }

  export interface UserSelectBlockText {
    type: 'USER_SELECT_BLOCK_TEXT'
    blockIndex: number
  }
  export function userSelectBlockText(blockIndex: number): UserSelectBlockText {
    return { type: 'USER_SELECT_BLOCK_TEXT', blockIndex }
  }

  export interface UserAnnotateCurrent {
    type: 'USER_ANNOTATE_CURRENT'
    tag: string
  }
  export function userAnnotateCurrent(tag: string): UserAnnotateCurrent {
    return { type: 'USER_ANNOTATE_CURRENT', tag }
  }

  export interface UserSelectCurrent {
    type: 'USER_SELECT_CURRENT'
  }
  export function userSelectCurrent(): UserSelectCurrent {
    return { type: 'USER_SELECT_CURRENT' }
  }

  export interface UserSetSel {
    type: 'USER_SET_SEL'
    sel: Set<string>
  }
  export function userSetSel(sel: Set<string>): UserSetSel {
    return { type: 'USER_SET_SEL', sel }
  }

  export interface UserClearSel {
    type: 'USER_CLEAR_SEL'
    method: 'auto' | 'manual'
  }
  export function userClearSel(method: 'auto' | 'manual'): UserClearSel {
    return { type: 'USER_CLEAR_SEL', method }
  }

  export interface UserClickDecoration {
    type: 'USER_CLICK_DECORATION'
    decoration: Decoration
    ctrlKey: boolean
  }
  export function userClickDecoration(
    decoration: Decoration,
    ctrlKey: boolean,
  ): UserClickDecoration {
    return { type: 'USER_CLICK_DECORATION', decoration, ctrlKey }
  }

  export interface UserDeleteCurrent {
    type: 'USER_DELETE_CURRENT'
  }
  export function userDeleteCurrent(): UserDeleteCurrent {
    return { type: 'USER_DELETE_CURRENT' }
  }

  export interface UserAcceptCurrent {
    type: 'USER_ACCEPT_CURRENT'
  }
  export function userAcceptCurrent(): UserAcceptCurrent {
    return { type: 'USER_ACCEPT_CURRENT' }
  }

  export interface UserSettleDiff {
    type: 'USER_SETTLE_DIFF'
    slotId: string
    choice: string
  }
  export function userSettleDiff(slotId: string, choice: string): UserSettleDiff {
    return { type: 'USER_SETTLE_DIFF', slotId, choice }
  }
  // endregion

  // region StateUpdateTypes
  type StateUpdateTypes =
    | UpdateFileInfo
    | UpdateEditorState
    | UpdateTaskMap
    | UpdateCache
    | UpdateDocStat

  export interface UpdateFileInfo {
    type: 'UPDATE_FILE_INFO'
    updater(fileInfo: FileInfo): FileInfo
  }

  export interface UpdateEditorState {
    type: 'UPDATE_EDITOR_STATE'
    updater(editor: EditorState): EditorState
  }

  export interface UpdateTaskMap {
    type: 'UPDATE_TASK_MAP'
    updater(s: TaskMap): TaskMap
  }

  export interface UpdateCache {
    type: 'UPDATE_CACHE'
    updater(c: CacheState): CacheState
  }
  export function updateCache(updater: (c: CacheState) => CacheState): UpdateCache {
    return { type: 'UPDATE_CACHE', updater }
  }

  export interface UpdateDocStat {
    type: 'UPDATE_DOC_STAT'
    updater(ds: DocStatState): DocStatState
  }
  // endregion

  // region HistoryTypes
  type HistoryTypes = HistoryClear | HistoryPop | HistoryPush | HistoryBack | HistoryForward

  export interface HistoryClear {
    type: 'HISTORY_CLEAR'
  }
  export function historyClear(): HistoryClear {
    return { type: 'HISTORY_CLEAR' }
  }

  export interface HistoryPop {
    type: 'HISTORY_POP'
  }
  export function historyPop(): HistoryPop {
    return { type: 'HISTORY_POP' }
  }

  export interface HistoryPush {
    type: 'HISTORY_PUSH'
    action: EditorAction
  }
  export function historyPush(action: EditorAction): HistoryPush {
    return { type: 'HISTORY_PUSH', action }
  }

  export interface HistoryBack {
    type: 'HISTORY_BACK'
  }
  export function historyBack(): HistoryBack {
    return { type: 'HISTORY_BACK' }
  }

  export interface HistoryForward {
    type: 'HISTORY_FORWARD'
  }
  export function historyForward(): HistoryForward {
    return { type: 'HISTORY_FORWARD' }
  }
  // endregion

  // region ClientsInfo
  export interface UpdateClientsInfo {
    type: 'UPDATE_CLIENTS_INFO'
    clients: any
  }
  export function updateClientsInfo(clients: any): UpdateClientsInfo {
    return { type: 'UPDATE_CLIENTS_INFO', clients }
  }
  // endregion
}

export default Action
