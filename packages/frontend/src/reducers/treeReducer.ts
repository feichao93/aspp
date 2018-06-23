import Action from '../utils/actions'

export type TreeItem = TreeDoc | TreeDirectory

export interface TreeDoc {
  type: 'doc'
  name: string
  collnames: string[]
}

export interface TreeDirectory {
  type: 'directory'
  name: string
  items: TreeItem[]
}

export default function treeReducer(state: TreeItem[] = null, action: Action): TreeItem[] {
  if (action.type === 'LOAD_TREE_STATE') {
    return action.treeState
  } else {
    return state
  }
}
