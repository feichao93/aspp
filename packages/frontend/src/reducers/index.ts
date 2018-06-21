import { TaskMap } from '../tasks'
import MainHistory from '../types/MainHistory'
import MainState from '../types/MainState'
import Action from '../utils/actions'
import cacheReducer, { CacheState } from './cacheReducer'
import configReducer, { ConfigState } from './configReducer'
import docStatReducer, { DocStatState } from './docStatReducer'
import historyReducer from './historyReducer'
import mainReducer from './mainReducer'
import miscReducer, { MiscState } from './miscReducer'
import taskReducer from './taskReducer'
import treeReducer, { TreeState } from './treeReducer'

export interface State {
  main: MainState
  misc: MiscState
  tree: TreeState
  config: ConfigState
  history: MainHistory
  taskMap: TaskMap
  cache: CacheState
  docStat: DocStatState
}

export default function reducer(state: State = {} as any, action: Action): State {
  return {
    misc: miscReducer(state.misc, action),
    main: mainReducer(state.main, action),
    tree: treeReducer(state.tree, action),
    config: configReducer(state.config, action),
    history: historyReducer(state.history, action),
    taskMap: taskReducer(state.taskMap, action),
    cache: cacheReducer(state.cache, action),
    docStat: docStatReducer(state.docStat, action),
  }
}
