import { Set } from 'immutable'
import { combineReducers } from 'redux'
import Decoration from './types/Decoration'
import Action from './utils/actions'
import * as testData from './testData'
import AnnotatedDoc from './types/AnnotatedDoc'
import DecorationRange from './types/DecorationRange'

export interface MiscState {
  darkTheme: boolean
  hideTaskTree: boolean
}

export interface State {
  doc: AnnotatedDoc
  sel: Set<Decoration>
  range: DecorationRange
  misc: MiscState
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

export function rangeReducer(state: DecorationRange = null, action: Action) {
  if (action.type === 'SET_RANGE') {
    return action.range
  } else {
    return state
  }
}

const darkTheme = localStorage.getItem('dark-theme') != null

export function miscReducer(state: MiscState = { darkTheme, hideTaskTree: false }, action: Action) {
  if (action.type === 'TOGGLE_DARK_THEME') {
    return { ...state, darkTheme: !state.darkTheme }
  } else if (action.type === 'TOGGLE_TASK_TREE_VISIBILITY') {
    return { ...state, hideTaskTree: !state.hideTaskTree }
  } else {
    return state
  }
}

export default combineReducers({
  doc: docReducer,
  sel: selReducer,
  range: rangeReducer,
  misc: miscReducer,
})
