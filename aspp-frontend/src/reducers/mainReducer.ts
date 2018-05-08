import * as testData from '../testData'
import Decoration from '../types/Decoration'
import MainState from '../types/MainState'
import Action from '../utils/actions'
import { toIdSet } from '../utils/common'

export default function mainReducer(
  state: MainState = new MainState({ doc: testData.plainDoc }),
  action: Action,
): MainState {
  if (action.type === 'R_ADD_DECORATIONS') {
    return state
      .update('annotations', as => as.merge(action.decorations.filter(Decoration.isAnnotation)))
      .update('hints', hs => hs.merge(action.decorations.filter(Decoration.isHint)))
      .update('slots', ss => ss.merge(action.decorations.filter(Decoration.isSlot)))
      .set('sel', toIdSet(action.decorations))
  } else if (action.type === 'R_REMOVE_DECORATIONS') {
    return state
      .update('annotations', m => m.filterNot(annotation => action.idSet.has(annotation.id)))
      .update('hints', hs => hs.filterNot(hint => action.idSet.has(hint.id)))
      .update('slots', ss => ss.filterNot(slot => action.idSet.has(slot.id)))
      .update('sel', sel => sel.filterNot(id => action.idSet.has(id)))
  } else if (action.type === 'R_SET_SEL') {
    return state.set('sel', action.sel)
  } else if (action.type === 'R_SET_RANGE') {
    return state.set('range', action.range)
  }
  return state
}
