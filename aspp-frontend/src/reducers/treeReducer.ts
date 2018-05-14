import Action from '../utils/actions'

export interface TreeState {
  docs: { name: string; annotations: string[] }[]
}

export default function treeReducer(state: TreeState, action: Action): TreeState {
  if (action.type === 'LOAD_DATA') {
    return action.data
  } else {
    return state
  }
}
