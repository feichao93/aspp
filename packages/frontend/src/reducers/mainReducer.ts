import { Map, Set } from 'immutable'
import Annotation from '../types/Annotation'
import { Hint, Slot } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import MainState from '../types/MainState'
import Action from '../utils/actions'

export default function mainReducer(state = new MainState(), action: Action): MainState {
  if (action.type === 'UPDATE_MAIN') {
    return action.updater(state)
  }
  return state
}

export function updateMain(updater: (s: MainState) => MainState): Action.UpdateMain {
  return { type: 'UPDATE_MAIN', updater }
}

export function addAnnotations(annotations: Map<string, Annotation>): Action.UpdateMain {
  return updateMain(s => s.update('annotations', as => as.merge(annotations)))
}

export function addSlots(slots: Map<string, Slot>): Action.UpdateMain {
  return updateMain(s => s.update('slots', ss => ss.merge(slots)))
}

export function addHints(hints: Map<string, Hint>): Action.UpdateMain {
  return updateMain(s => s.update('hints', hs => hs.merge(hints)))
}

export function deleteDecorations(idSet: Set<string>): Action.UpdateMain {
  return updateMain(state =>
    state
      .update('annotations', m => m.filterNot(annotation => idSet.has(annotation.id)))
      .update('hints', hs => hs.filterNot(hint => idSet.has(hint.id)))
      .update('slots', ss => ss.filterNot(slot => idSet.has(slot.id)))
      .update('sel', sel => sel.filterNot(id => idSet.has(id))),
  )
}

export function setSel(sel: Set<string>): Action.UpdateMain {
  // 当 sel 变为非空时，自动清空 range
  return updateMain(s => s.set('sel', sel).set('range', sel.isEmpty() ? s.range : null))
}

export function setRange(range: DecorationRange): Action.UpdateMain {
  return updateMain(s => s.set('range', range))
}
