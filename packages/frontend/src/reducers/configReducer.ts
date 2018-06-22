import { Map, Record } from 'immutable'
import ASPP_CONFIG from '../aspp-config'
import store from '../store'
import Action from '../utils/actions'
import { not } from '../utils/common'

const darkTheme = localStorage.getItem('dark-theme') != null
const hideTaskTree = localStorage.getItem('hide-task-tree') != null
const username = localStorage.getItem('username')

window.addEventListener('beforeunload', () => {
  const state = store.getState()
  if (state.config.darkTheme) {
    localStorage.setItem('dark-theme', 'F')
  } else {
    localStorage.removeItem('dark-theme')
  }

  if (state.config.hideTaskTree) {
    localStorage.setItem('hide-task-tree', '')
  } else {
    localStorage.removeItem('hide-task-tree')
  }

  if (state.config.username != null) {
    localStorage.setItem('username', state.config.username)
  } else {
    localStorage.removeItem('username')
  }
})

export class Config extends Record({
  helpOverlay: false,
  darkTheme,
  hideTaskTree,
  username,
  visibleMap: Map(ASPP_CONFIG.asppConfig.tags.map(tag => [tag.name, true] as [string, boolean])),
}) {}

export default function configReducer(state = new Config(), action: Action) {
  if (action.type === 'TOGGLE_DARK_THEME') {
    return state.update('darkTheme', not)
  } else if (action.type === 'TOGGLE_HELP_OVERLAY') {
    return state.update('helpOverlay', not)
  } else if (action.type === 'TOGGLE_TASK_TREE_VISIBILITY') {
    return state.update('hideTaskTree', not)
  } else if (action.type === 'SET_USERNAME') {
    return state.set('username', action.username)
  } else if (action.type === 'TOGGLE_TAG_VISIBILITY') {
    return state.update('visibleMap', map => map.update(action.tagName, not))
  } else if (action.type === 'SET_TAG_GROUP_VISIBILITY') {
    const tagNameSet = ASPP_CONFIG.groups
      .get(action.groupName)
      .map(g => g.name)
      .toSet()
    return state.update('visibleMap', visibleMap =>
      visibleMap.map((old, tagName) => (tagNameSet.has(tagName) ? action.visible : old)),
    )
  } else {
    return state
  }
}
