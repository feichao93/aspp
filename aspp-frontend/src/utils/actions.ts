import { Map, Set } from 'immutable'
import Decoration from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'

type Action = Action.ALL

namespace Action {
  export type ALL =
    | AddDecorations
    | RemoveDecorations
    | SetSel
    | SelectBlockText
    | ClearBlockDecorations
    | SetRange
    | Toast
    | Annotate
    | ClickDecoration
    | ClearAnnotation
    | SelectMatch
    | ToggleDarkTheme
    | ToggleTaskTreeVisibility

  export interface AddDecorations {
    type: 'ADD_DECORATIONS'
    decorations: Map<string, Decoration>
  }

  export interface RemoveDecorations {
    type: 'REMOVE_DECORATIONS'
    idSet: Set<string>
  }

  export interface SetSel {
    type: 'SET_SEL'
    sel: Set<string>
  }

  export interface SelectBlockText {
    type: 'SELECT_BLOCK_TEXT'
    blockIndex: number
  }

  export interface ClearBlockDecorations {
    type: 'CLEAR_BLOCK_DECORATIONS'
    blockIndex: number
  }

  export interface SetRange {
    type: 'SET_RANGE'
    range: DecorationRange
  }

  export interface Toast {
    type: 'TOAST'
    message: string
  }

  export interface Annotate {
    type: 'ANNOTATE'
    tag: string
  }

  export interface ClickDecoration {
    type: 'CLICK_DECORATION'
    decoration: Decoration
    ctrlKey: boolean
  }

  export interface ClearAnnotation {
    type: 'CLEAR_ANNOTATION'
  }

  export interface SelectMatch {
    type: 'SELECT_MATCH'
    pattern: string | RegExp
  }

  export interface ToggleDarkTheme {
    type: 'TOGGLE_DARK_THEME'
  }

  export interface ToggleTaskTreeVisibility {
    type: 'TOGGLE_TASK_TREE_VISIBILITY'
  }
}

export default Action
