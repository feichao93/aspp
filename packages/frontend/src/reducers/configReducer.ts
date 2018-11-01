import { Map, Record } from 'immutable'
import ASPP_CONFIG from '../aspp-config'
import store from '../store'
import Action from '../utils/actions'
import { not } from '../utils/common'

const hideFileTree = localStorage.getItem('hide-file-tree') != null
const hidePanels = localStorage.getItem('hide-panels') != null
const username = localStorage.getItem('username')

window.addEventListener('beforeunload', () => {
  const state = store.getState()

  if (state.config.hideFileTree) {
    localStorage.setItem('hide-file-tree', '')
  } else {
    localStorage.removeItem('hide-file-tree')
  }

  if (state.config.hidePanels) {
    localStorage.setItem('hide-panels', '')
  } else {
    localStorage.removeItem('hide-panels')
  }

  if (state.config.username != null) {
    localStorage.setItem('username', state.config.username)
  } else {
    localStorage.removeItem('username')
  }
})

export class Config extends Record({
  helpOverlay: false,
  hideFileTree,
  hidePanels,
  username,
  visibleMap: Map(ASPP_CONFIG.asppConfig.tags.map(tag => [tag.name, true] as [string, boolean])),
}) {}

export default function configReducer(state = new Config(), action: Action) {
  if (action.type === 'TOGGLE_HELP_OVERLAY') {
    return state.update('helpOverlay', not)
  } else if (action.type === 'TOGGLE_FILE_TREE_VISIBILITY') {
    return state.update('hideFileTree', not)
  } else if (action.type === 'TOGGLE_PANELS_VISIBILITY') {
    return state.update('hidePanels', not)
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
