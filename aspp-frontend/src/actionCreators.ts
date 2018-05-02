import { Set } from 'immutable'
import Action from './actions'
import Annotation from './types/Annotation'
import DecorationRange from './types/DecorationRange'
import { Decoration } from './types/DecorationSet'

export function addOneAnnotation(annotation: Annotation): Action.AddAnnotationSet {
  return {
    type: 'ADD_ANNOTATION_SET',
    setToAdd: Set.of(annotation),
  }
}

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

export function removeOneAnnotation(annotation: Annotation): Action.RemoveAnnotationSet {
  return {
    type: 'REMOVE_ANNOTATION_SET',
    setToRemove: Set.of(annotation),
  }
}

export function setSel(sel: Set<Decoration>): Action.SetSel {
  return { type: 'SET_SEL', sel }
}

export function setRange(range: DecorationRange): Action.SetRange {
  return { type: 'SET_RANGE', range }
}

export function toast(text: string): Action.Toast {
  return { type: 'TOAST', text }
}
