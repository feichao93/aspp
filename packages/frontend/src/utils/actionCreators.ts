import { Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import MainAction from '../actions/MainAction'
import { TreeState } from '../reducers/treeReducer'
import TaskConstructor from '../tasks/TaskConstructor'
import Decoration from '../types/Decoration'
import MainState from '../types/MainState'
import Action from './actions'

// TODO  移动到 Actions 文件中

export function setMainState(mainState: MainState): Action.UpdateMain {
  return { type: 'UPDATE_MAIN', updater: () => mainState }
}

export function userSelectBlockHints(blockIndex: number): Action.UserSelectBlockHints {
  return { type: 'USER_SELECT_BLOCK_HINTS', blockIndex }
}

export function userSelectBlockText(blockIndex: number): Action.UserSelectBlockText {
  return { type: 'USER_SELECT_BLOCK_TEXT', blockIndex }
}

export function toast(text: string, intent = Intent.NONE): Action.Toast {
  return { type: 'TOAST', message: text, intent }
}

export function userAnnotateCurrent(tag: string): Action.UserAnnotateCurrent {
  return { type: 'USER_ANNOTATE_CURRENT', tag }
}

export function userSetSel(sel: Set<string>): Action.UserSetSel {
  return { type: 'USER_SET_SEL', sel }
}

export function userSelectCurrent(): Action.UserSelectCurrent {
  return { type: 'USER_SELECT_CURRENT' }
}

export function userClearSel(method: 'auto' | 'manual'): Action.UserClearSel {
  return { type: 'USER_CLEAR_SEL', method }
}

export function userDeleteCurrent(): Action.UserDeleteCurrent {
  return { type: 'USER_DELETE_CURRENT' }
}

export function userAcceptCurrent(): Action.UserAcceptCurrent {
  return { type: 'USER_ACCEPT_CURRENT' }
}

export function userClickDecoration(
  decoration: Decoration,
  ctrlKey: boolean,
): Action.UserClickDecoration {
  return { type: 'USER_CLICK_DECORATION', decoration, ctrlKey }
}

export function toggleHelpOverlay(): Action.ToggleHelpOverlay {
  return { type: 'TOGGLE_HELP_OVERLAY' }
}

export function toggleDarkTheme(): Action.ToggleDarkTheme {
  return { type: 'TOGGLE_DARK_THEME' }
}

export function toggleTaskTreeVisibility(): Action.ToggleTaskTreeVisibility {
  return { type: 'TOGGLE_TASK_TREE_VISIBILITY' }
}

export function loadTreeData(treeState: TreeState): Action.LoadTreeState {
  return { type: 'LOAD_TREE_STATE', treeState }
}

export function requestAddColl(docname: string): Action.RequestAddColl {
  return { type: 'REQUEST_ADD_COLL', docname }
}

export function requestDeleteColl(docname: string, collName: string): Action.RequestDeleteColl {
  return {
    type: 'REQUEST_DELETE_COLL',
    docname,
    collName,
  }
}

export function requestCloseCurrentColl(): Action.RequestCloseCurrentColl {
  return { type: 'REQUEST_CLOSE_CURRENT_COLL' }
}

export function requestSaveCurrentColl(): Action.RequestSaveCurrentColl {
  return { type: 'REQUEST_SAVE_CURRENT_COLL' }
}

export function requestOpenDocStat(docname: string): Action.RequestOpenDocStat {
  return { type: 'REQUEST_OPEN_DOC_STAT', docname }
}

export function requestOpenColl(docname: string, collName: string): Action.RequestOpenColl {
  return {
    type: 'REQUEST_OPEN_COLL',
    docname,
    collName,
  }
}

export function setUsername(username: string): Action.SetUsername {
  return { type: 'SET_USERNAME', username }
}

export function requestDiffColls(docname: string, collNames: string[]): Action.RequestDiffColls {
  return { type: 'REQUEST_DIFF_COLLS', docname, collNames }
}

export function requestLoadTree(reload: boolean): Action.RequestLoadTree {
  return { type: 'REQUEST_LOAD_TREE', reload }
}

export function toggleTagVisibility(tagName: string): Action.ToggleTagVisibility {
  return { type: 'TOGGLE_TAG_VISIBILITY', tagName }
}

export function userSetTagGroupVisibility(
  groupName: string,
  visible: boolean,
): Action.SetTagGroupVisibility {
  return {
    type: 'SET_TAG_GROUP_VISIBILITY',
    groupName,
    visible,
  }
}

export function userRequestRevert(): Action.UserRequestRevert {
  return { type: 'USER_REQUEST_REVERT' }
}

export function userRequestUndo(): Action.UserRequestUndo {
  return { type: 'USER_REQUEST_UNDO' }
}

export function userRequestRedo(): Action.UserRequestRedo {
  return { type: 'USER_REQUEST_REDO' }
}

export function historyClear(): Action.HistoryClear {
  return { type: 'HISTORY_CLEAR' }
}

export function historyPop(): Action.HistoryPop {
  return { type: 'HISTORY_POP' }
}

export function historyPush(action: MainAction): Action.HistoryPush {
  return { type: 'HISTORY_PUSH', action }
}

export function historyBack(): Action.HistoryBack {
  return { type: 'HISTORY_BACK' }
}

export function historyForward(): Action.HistoryForward {
  return { type: 'HISTORY_FORWARD' }
}

export function addTask(impl: TaskConstructor, options: any): Action.AddTask {
  return { type: 'ADD_TASK', impl, options }
}

export function deleteTask(id: string): Action.DeleteTask {
  return { type: 'DELETE_TASK', id }
}

export function runTask(id: string): Action.RunTask {
  return { type: 'RUN_TASK', id }
}

export function stopTask(id: string): Action.StopTask {
  return { type: 'STOP_TASK', id }
}
