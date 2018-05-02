import { Set } from 'immutable'
import { combineReducers } from 'redux'
import * as testData from './testData'
import AnnotatedDoc from './types/AnnotatedDoc'
import { Decoration } from './types/DecorationSet'
import Action from './actions'

export interface State {
  doc: AnnotatedDoc
  sel: Set<Decoration>
}

export function docReducer(state = testData.annotatedDoc, action: Action) {
  if (action.type === 'ADD_ANNOTATION_SET') {
    return state.update('annotationSet', set => set.union(action.setToAdd))
  } else if (action.type === 'REMOVE_ANNOTATION_SET') {
    return state.update('annotationSet', set => set.subtract(action.setToRemove))
  } else {
    return state
  }
}

export function selReducer(state = Set<Decoration>(), action: Action) {
  if (action.type === 'SET_SEL') {
    return action.sel
  } else {
    return state
  }
}

export default combineReducers({
  doc: docReducer,
  sel: selReducer,
})
