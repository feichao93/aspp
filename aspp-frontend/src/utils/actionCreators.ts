import { Set } from 'immutable'
import Annotation from '../types/Annotation'
import Decoration from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import Action from './actions'

export function addAnnotationSet(setToAdd: Set<Annotation>): Action.AddAnnotationSet {
  return {
    type: 'ADD_ANNOTATION_SET',
    setToAdd,
  }
}

export function removeAnnotationSet(setToRemove: Set<Annotation>): Action.RemoveAnnotationSet {
  return {
    type: 'REMOVE_ANNOTATION_SET',
    setToRemove,
  }
}

export function setSel(sel: Set<Decoration>): Action.SetSel {
  return { type: 'SET_SEL', sel }
}

export function setRange(range: DecorationRange): Action.SetRange {
  return { type: 'SET_RANGE', range }
}

export function toast(text: string): Action.Toast {
  return { type: 'TOAST', message: text }
}

export function annotate(tag: string): Action.Annotate {
  return { type: 'ANNOTATE', tag }
}

export function clearAnnotation(): Action.ClearAnnotation {
  return { type: 'CLEAR_ANNOTATION' }
}

export function clickDecoration(decoration: Decoration, ctrlKey: boolean): Action.ClickDecoration {
  return { type: 'CLICK_DECORATION', decoration, ctrlKey }
}

export function selectMatch(pattern: string | RegExp): Action.SelectMatch {
  return { type: 'SELECT_MATCH', pattern }
}

export function toggleDarkTheme(): Action.ToggleDarkTheme {
  return { type: 'TOGGLE_DARK_THEME' }
}
