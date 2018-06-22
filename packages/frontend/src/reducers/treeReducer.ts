import Action from '../utils/actions'

export type TreeItem = TreeDoc // TODO TreeFolder

export interface TreeDoc {
  // type: 'doc'
  name: string
  annotations: string[]
}

export interface TreeFolder {
  type: 'folder'
  name: string
  children: TreeItem[]
}

export interface TreeState {
  docs: TreeItem[]
}

export default function treeReducer(state: TreeState = null, action: Action): TreeState {
  if (action.type === 'LOAD_TREE_STATE') {
    return action.treeState
  } else {
    return state
  }
}
