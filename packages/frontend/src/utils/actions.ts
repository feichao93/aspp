import { Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import MainAction from '../actions/MainAction'
import { CacheState } from '../reducers/cacheReducer'
import { DocStatState } from '../reducers/docStatReducer'
import { TreeState } from '../reducers/treeReducer'
import { TaskMap } from '../tasks'
import TaskConstructor from '../tasks/TaskConstructor'
import Decoration from '../types/Decoration'
import MainState from '../types/MainState'

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
    | UserToggleTagVisibility

  export interface Toast {
    type: 'TOAST'
    message: string
    intent: Intent
  }

  export interface ToggleHelpOverlay {
    type: 'R_TOGGLE_HELP_OVERLAY'
  }

  export interface ToggleDarkTheme {
    type: 'R_TOGGLE_DARK_THEME'
  }

  export interface ToggleTaskTreeVisibility {
    type: 'R_TOGGLE_TASK_TREE_VISIBILITY'
  }

  export interface SetUsername {
    type: 'R_SET_USERNAME'
    username: string
  }

  export interface UserToggleTagVisibility {
    type: 'USER_TOGGLE_TAG_VISIBILITY'
    tagName: string
  }

  export interface UserSetTagGroupVisibility {
    type: 'USER_SET_TAG_GROUP_VISIBILITY'
    groupName: string
    visible: boolean
  }

  export interface UserRequestRevert {
    type: 'USER_REQUEST_REVERT'
  }

  export interface UserRequestUndo {
    type: 'USER_REQUEST_UNDO'
  }

  export interface UserRequestRedo {
    type: 'USER_REQUEST_REDO'
  }
  // endregion

  // region FileTypes
  type FileTypes =
    | RequestDiffColls
    | RequestLoadTree
    | LoadData
    | RequestAddColl
    | RequestDeleteColl
    | RequestCloseCurrentColl
    | RequestSaveCurrentColl
    | RequestOpenDocStat
    | RequestOpenColl

  export interface RequestDiffColls {
    type: 'REQUEST_DIFF_COLLS'
    docname: string
    collNames: string[]
  }

  export interface RequestLoadTree {
    type: 'REQUEST_LOAD_TREE'
    reload: boolean
  }

  export interface LoadData {
    type: 'LOAD_DATA'
    data: TreeState
  }

  export interface RequestAddColl {
    type: 'REQUEST_ADD_COLL'
    docname: string
  }

  export interface RequestDeleteColl {
    type: 'REQUEST_DELETE_COLL'
    docname: string
    collName: string
  }

  export interface RequestCloseCurrentColl {
    type: 'REQUEST_CLOSE_CURRENT_COLL'
  }

  export interface RequestSaveCurrentColl {
    type: 'REQUEST_SAVE_CURRENT_COLL'
  }

  export interface RequestOpenDocStat {
    type: 'REQUEST_OPEN_DOC_STAT'
    docname: string
  }

  export interface RequestOpenColl {
    type: 'REQUEST_OPEN_COLL'
    docname: string
    collName: string
  }
  // endregion

  // region TaskTypes
  type TaskTypes = AddTask | DeleteTask | RunTask | StopTask

  export interface AddTask {
    type: 'ADD_TASK'
    impl: TaskConstructor
    options: any
  }

  export interface DeleteTask {
    type: 'DELETE_TASK'
    id: string
  }

  export interface RunTask {
    type: 'RUN_TASK'
    id: string
  }

  export interface StopTask {
    type: 'STOP_TASK'
    id: string
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
    | UserSetTagGroupVisibility
    | UserSelectBlockHints
    | UserSelectBlockText
    | UserClickDecoration

  export interface UserSelectBlockHints {
    type: 'USER_SELECT_BLOCK_HINTS'
    blockIndex: number
  }

  export interface UserSelectBlockText {
    type: 'USER_SELECT_BLOCK_TEXT'
    blockIndex: number
  }

  export interface UserAnnotateCurrent {
    type: 'USER_ANNOTATE_CURRENT'
    tag: string
  }

  export interface UserSelectCurrent {
    type: 'USER_SELECT_CURRENT'
  }

  export interface UserSetSel {
    type: 'USER_SET_SEL'
    sel: Set<string>
  }

  export interface UserClearSel {
    type: 'USER_CLEAR_SEL'
    method: 'auto' | 'manual'
  }

  export interface UserClickDecoration {
    type: 'USER_CLICK_DECORATION'
    decoration: Decoration
    ctrlKey: boolean
  }

  export interface UserDeleteCurrent {
    type: 'USER_DELETE_CURRENT'
  }

  export interface UserAcceptCurrent {
    type: 'USER_ACCEPT_CURRENT'
  }
  // endregion

  // region StateUpdateTypes
  type StateUpdateTypes = UpdateMain | UpdateTaskMap | UpdateCache | UpdateDocStat

  export interface UpdateMain {
    type: 'UPDATE_MAIN'
    updater(s: MainState): MainState
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

  export interface HistoryPop {
    type: 'HISTORY_POP'
  }

  export interface HistoryPush {
    type: 'HISTORY_PUSH'
    action: MainAction
  }

  export interface HistoryBack {
    type: 'HISTORY_BACK'
  }

  export interface HistoryForward {
    type: 'HISTORY_FORWARD'
  }
  // endregion
}

export default Action
