import { TaskMap } from '../tasks'
import EditorHistory from '../types/EditorHistory'
import EditorState from '../types/EditorState'
import FileInfo from '../types/FileInfo'
import Action from '../utils/actions'
import cacheReducer, { CacheState } from './cacheReducer'
import clientsReducer, { ClientsState } from './clientsReducer'
import configReducer, { Config } from './configReducer'
import dialogReducer, { DialogState } from './dialogReducer'
import docStatReducer, { DocStatState } from './docStatReducer'
import editorReducer from './editorReducer'
import fileInfoReducer from './fileInfoReducer'
import historyReducer from './historyReducer'
import taskReducer from './taskReducer'
import treeReducer, { TreeItem } from './treeReducer'

export interface State {
  editor: EditorState
  tree: TreeItem[]
  fileInfo: FileInfo
  config: Config
  history: EditorHistory
  taskMap: TaskMap
  cache: CacheState
  docStat: DocStatState
  dialog: DialogState
  clients: ClientsState
}

export default function reducer(state: Partial<State> = {}, action: Action): State {
  return {
    editor: editorReducer(state.editor, action),
    tree: treeReducer(state.tree, action),
    fileInfo: fileInfoReducer(state.fileInfo, action),
    config: configReducer(state.config, action),
    history: historyReducer(state.history, action),
    taskMap: taskReducer(state.taskMap, action),
    cache: cacheReducer(state.cache, action),
    docStat: docStatReducer(state.docStat, action),
    dialog: dialogReducer(state.dialog, action),
    clients: clientsReducer(state.clients, action),
  }
}
