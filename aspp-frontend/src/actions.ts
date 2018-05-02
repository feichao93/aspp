import { Set } from 'immutable'
import Annotation from './types/Annotation'
import DecorationRange from './types/DecorationRange'
import { Decoration } from './types/DecorationSet'

type Action = Action.ALL

namespace Action {
  export type ALL = AddAnnotationSet | RemoveAnnotationSet | SetSel | SetRange | Toast

  export interface AddAnnotationSet {
    type: 'ADD_ANNOTATION_SET'
    setToAdd: Set<Annotation>
  }

  export interface RemoveAnnotationSet {
    type: 'REMOVE_ANNOTATION_SET'
    setToRemove: Set<Annotation>
  }

  export interface SetSel {
    type: 'SET_SEL'
    sel: Set<Decoration>
  }

  export interface SetRange {
    type: 'SET_RANGE'
    range: DecorationRange
  }

  export interface Toast {
    type: 'TOAST'
    text: string
  }
}

export default Action
