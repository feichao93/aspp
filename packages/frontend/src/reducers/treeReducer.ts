import Action from '../utils/actions'

export interface TreeDoc {
  name: string
  annotations: string[]
}

export interface TreeState {
  docs: TreeDoc[]
}

export default function treeReducer(state: TreeState, action: Action): TreeState {
  if (action.type === 'LOAD_DATA') {
    return action.data
  } else {
    return state
  }
}
