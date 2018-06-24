import { Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import EditorAction from '../actions/EditorAction'
import { CacheState } from '../reducers/cacheReducer'
import { DocStatState } from '../reducers/docStatReducer'
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

  // region MiscTypes
  type MiscTypes =
    | Toast
    | ToggleHelpOverlay
    | ToggleDarkTheme
    | ToggleTaskTreeVisibility
    | SetUsername
    | ToggleTagVisibility

  export interface Toast {
    type: 'TOAST'
    message: string
    intent: Intent
  }
  export function toast(text: string, intent = Intent.NONE): Toast {
    return { type: 'TOAST', message: text, intent }
  }

  export interface ToggleHelpOverlay {
    type: 'TOGGLE_HELP_OVERLAY'
  }
  export function toggleHelpOverlay(): ToggleHelpOverlay {
    return { type: 'TOGGLE_HELP_OVERLAY' }
  }

  export interface ToggleDarkTheme {
    type: 'TOGGLE_DARK_THEME'
  }
  export function toggleDarkTheme(): ToggleDarkTheme {
    return { type: 'TOGGLE_DARK_THEME' }
  }

  export interface ToggleTaskTreeVisibility {
    type: 'TOGGLE_TASK_TREE_VISIBILITY'
  }
  export function toggleTaskTreeVisibility(): ToggleTaskTreeVisibility {
    return { type: 'TOGGLE_TASK_TREE_VISIBILITY' }
  }

  export interface SetUsername {
    type: 'SET_USERNAME'
    username: string
  }
  export function setUsername(username: string): SetUsername {
    return { type: 'SET_USERNAME', username }
  }

  export interface ToggleTagVisibility {
    type: 'TOGGLE_TAG_VISIBILITY'
    tagName: string
  }
  export function toggleTagVisibility(tagName: string): ToggleTagVisibility {
    return { type: 'TOGGLE_TAG_VISIBILITY', tagName }
  }

  export interface SetTagGroupVisibility {
    type: 'SET_TAG_GROUP_VISIBILITY'
    groupName: string
    visible: boolean
  }
  export function userSetTagGroupVisibility( // TODO
    groupName: string,
    visible: boolean,
  ): SetTagGroupVisibility {
    return { type: 'SET_TAG_GROUP_VISIBILITY', groupName, visible }
  }

  export interface UserRequestRevert {
    type: 'USER_REQUEST_REVERT'
  }
  export function userRequestRevert(): UserRequestRevert {
    return { type: 'USER_REQUEST_REVERT' }
  }

  export interface UserRequestUndo {
    type: 'USER_REQUEST_UNDO'
  }
  export function userRequestUndo(): UserRequestUndo {
    return { type: 'USER_REQUEST_UNDO' }
  }

  export interface UserRequestRedo {
    type: 'USER_REQUEST_REDO'
  }
  export function userRequestRedo(): UserRequestRedo {
    return { type: 'USER_REQUEST_REDO' }
  }
  // endregion

  // region FileTypes
  type FileTypes =
    | RequestDiffColls
    | RequestLoadTree
    | LoadTreeState
    | RequestAddColl
    | RequestDeleteColl
    | RequestCloseCurrentColl
    | RequestSaveCurrentColl
    | RequestOpenDocStat
    | RequestOpenColl

  export interface RequestDiffColls {
    type: 'REQUEST_DIFF_COLLS'
    docname: string
    collnames: string[]
  }
  export function requestDiffColls(docname: string, collnames: string[]): RequestDiffColls {
    return { type: 'REQUEST_DIFF_COLLS', docname, collnames }
  }

  export interface RequestLoadTree {
    type: 'REQUEST_LOAD_TREE'
    reload: boolean
  }
  export function requestLoadTree(reload: boolean): RequestLoadTree {
    return { type: 'REQUEST_LOAD_TREE', reload }
  }

  export interface LoadTreeState {
    type: 'LOAD_TREE_STATE'
    treeState: TreeItem[]
  }
  export function loadTreeData(treeState: TreeItem[]): LoadTreeState {
    return { type: 'LOAD_TREE_STATE', treeState }
  }

  export interface RequestAddColl {
    type: 'REQUEST_ADD_COLL'
    fileInfo: FileInfo
  }
  export function requestAddColl(fileInfo: FileInfo): RequestAddColl {
    return { type: 'REQUEST_ADD_COLL', fileInfo }
  }

  export interface RequestDeleteColl {
    type: 'REQUEST_DELETE_COLL'
    fileInfo: FileInfo
  }
  export function requestDeleteColl(fileInfo: FileInfo): RequestDeleteColl {
    return { type: 'REQUEST_DELETE_COLL', fileInfo }
  }

  export interface RequestCloseCurrentColl {
    type: 'REQUEST_CLOSE_CURRENT_COLL'
  }
  export function requestCloseCurrentColl(): RequestCloseCurrentColl {
    return { type: 'REQUEST_CLOSE_CURRENT_COLL' }
  }

  export interface RequestSaveCurrentColl {
    type: 'REQUEST_SAVE_CURRENT_COLL'
  }
  export function requestSaveCurrentColl(): RequestSaveCurrentColl {
    return { type: 'REQUEST_SAVE_CURRENT_COLL' }
  }

  export interface RequestOpenDocStat {
    type: 'REQUEST_OPEN_DOC_STAT'
    fileInfo: FileInfo
  }
  export function requestOpenDocStat(fileInfo: FileInfo): RequestOpenDocStat {
    return { type: 'REQUEST_OPEN_DOC_STAT', fileInfo }
  }

  export interface RequestOpenColl {
    type: 'REQUEST_OPEN_COLL'
    fileInfo: FileInfo
  }
  export function requestOpenColl(fileInfo: FileInfo): RequestOpenColl {
    return { type: 'REQUEST_OPEN_COLL', fileInfo }
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
    | UserRequestRedo
    | UserRequestRevert
    | UserRequestUndo
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
}

export default Action
