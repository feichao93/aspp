import MainState from '../types/MainState'
import Action from '../utils/actions'

export default function mainReducer(state = new MainState(), action: Action): MainState {
  if (action.type === 'R_SET_MAIN_STATE') {
    return action.mainState
  } else if (action.type === 'R_ADD_ANNOTATIONS') {
    return state.update('annotations', as => as.merge(action.annotations)).set('altered', true)
  } else if (action.type === 'R_ANNOTATIONS_SAVED') {
    return state.set('altered', false)
  } else if (action.type === 'R_ADD_HINTS') {
    return state.update('hints', hs => hs.merge(action.hints))
  } else if (action.type === 'R_ADD_SLOTS') {
    return state.update('slots', ss => ss.merge(action.slots))
  } else if (action.type === 'R_DELETE_DECORATIONS') {
    return state
      .update('annotations', m => m.filterNot(annotation => action.idSet.has(annotation.id)))
      .update('hints', hs => hs.filterNot(hint => action.idSet.has(hint.id)))
      .update('slots', ss => ss.filterNot(slot => action.idSet.has(slot.id)))
      .update('sel', sel => sel.filterNot(id => action.idSet.has(id)))
      .set('altered', state.altered || state.annotations.some(an => action.idSet.has(an.id)))
  } else if (action.type === 'R_SET_SEL') {
    return state.set('sel', action.sel)
  } else if (action.type === 'R_SET_RANGE') {
    return state.set('range', action.range)
  }
  return state
}
