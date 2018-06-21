import { Map, Record } from 'immutable'
import ASPP_CONFIG from '../aspp-config'
import Action from '../utils/actions'
import { not } from '../utils/common'

export class ConfigState extends Record({
  visibleMap: Map<string, boolean>(),
}) {}

const initConfigState = new ConfigState({
  visibleMap: Map(ASPP_CONFIG.asppConfig.tags.map(tag => [tag.name, true] as [string, boolean])),
})

export default function configReducer(state = initConfigState, action: Action) {
  if (action.type === 'USER_TOGGLE_TAG_VISIBILITY') {
    return state.update('visibleMap', map => map.update(action.tagName, not))
  } else if (action.type === 'USER_SET_TAG_GROUP_VISIBILITY') {
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
