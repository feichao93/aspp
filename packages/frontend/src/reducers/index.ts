import { TaskMap } from '../tasks'
import FileInfo from '../types/FileInfo'
import MainHistory from '../types/MainHistory'
import MainState from '../types/MainState'
import Action from '../utils/actions'
import cacheReducer, { CacheState } from './cacheReducer'
import configReducer, { Config } from './configReducer'
import docStatReducer, { DocStatState } from './docStatReducer'
import historyReducer from './historyReducer'
import mainReducer from './mainReducer'
import openInfoReducer from './openInfoReducer'
import taskReducer from './taskReducer'
import treeReducer, { TreeItem } from './treeReducer'

export interface State {
  // TODO collName -> collname ； 将 collname 和 docname 放到 openInfo 中
  main: MainState
  tree: TreeItem[]
  openInfo: FileInfo
  config: Config
  history: MainHistory
  taskMap: TaskMap
  cache: CacheState
  docStat: DocStatState
}

export default function reducer(state: Partial<State> = {}, action: Action): State {
  return {
    main: mainReducer(state.main, action),
    tree: treeReducer(state.tree, action),
    openInfo: openInfoReducer(state.openInfo, action),
    config: configReducer(state.config, action),
    history: historyReducer(state.history, action),
    taskMap: taskReducer(state.taskMap, action),
    cache: cacheReducer(state.cache, action),
    docStat: docStatReducer(state.docStat, action),
  }
}
