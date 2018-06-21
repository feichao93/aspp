import Action from '../utils/actions'

const darkTheme = localStorage.getItem('dark-theme') != null
const hideTaskTree = localStorage.getItem('hide-task-tree') != null
const username = localStorage.getItem('username')

export interface MiscState {
  helpOverlay: boolean
  darkTheme: boolean
  hideTaskTree: boolean
  username: string
}

const initMiscState: MiscState = {
  helpOverlay: false,
  darkTheme,
  hideTaskTree,
  username,
}

export default function miscReducer(state = initMiscState, action: Action): MiscState {
  if (action.type === 'R_TOGGLE_DARK_THEME') {
    return { ...state, darkTheme: !state.darkTheme }
  } else if (action.type === 'R_TOGGLE_HELP_OVERLAY') {
    return { ...state, helpOverlay: !state.helpOverlay }
  } else if (action.type === 'R_TOGGLE_TASK_TREE_VISIBILITY') {
    return { ...state, hideTaskTree: !state.hideTaskTree }
  } else if (action.type === 'R_SET_USERNAME') {
    return { ...state, username: action.username }
  } else {
    return state
  }
}
