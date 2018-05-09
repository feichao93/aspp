import { Map, Set } from 'immutable'
import Decoration, { Hint } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'

type Action = Action.ALL

namespace Action {
  export type ALL =
    | AddDecorations
    | RemoveDecorations
    | SetSel
    | SelectBlockText
    | AcceptBlock
    | ClearBlockDecorations
    | SetRange
    | Toast
    | AnnotateCurrent
    | ClickDecoration
    | DeleteCurrent
    | AcceptCurrent
    | SelectMatch
    | ToggleDarkTheme
    | ToggleTaskTreeVisibility
    | AcceptHints
    | RequestDownloadResult

  export interface AddDecorations {
    type: 'R_ADD_DECORATIONS'
    decorations: Map<string, Decoration>
  }

  export interface RemoveDecorations {
    type: 'R_REMOVE_DECORATIONS'
    idSet: Set<string>
  }

  export interface SetSel {
    type: 'R_SET_SEL'
    sel: Set<string>
  }

  export interface SelectBlockText {
    type: 'SELECT_BLOCK_TEXT'
    blockIndex: number
  }

  export interface AcceptBlock {
    type: 'ACCEPT_BLOCK'
    blockIndex: number
  }

  // TODO rename to DELETE_BLOCK_DECORATIONS
  export interface ClearBlockDecorations {
    type: 'CLEAR_BLOCK_DECORATIONS'
    blockIndex: number
  }

  export interface SetRange {
    type: 'R_SET_RANGE'
    range: DecorationRange
  }

  export interface Toast {
    type: 'TOAST'
    message: string
  }

  export interface AnnotateCurrent {
    type: 'ANNOTATE_CURRENT'
    tag: string
  }

  export interface ClickDecoration {
    type: 'CLICK_DECORATION'
    decoration: Decoration
    ctrlKey: boolean
  }

  export interface DeleteCurrent {
    type: 'DELETE_CURRENT'
  }

  export interface AcceptCurrent {
    type: 'ACCEPT_CURRENT'
  }

  export interface SelectMatch {
    type: 'SELECT_MATCH'
    pattern: string | RegExp
  }

  export interface ToggleDarkTheme {
    type: 'R_TOGGLE_DARK_THEME'
  }

  export interface ToggleTaskTreeVisibility {
    type: 'R_TOGGLE_TASK_TREE_VISIBILITY'
  }

  export interface AcceptHints {
    type: 'ACCEPT_HINTS'
    accepting: Map<string, Hint>
  }

  export interface RequestDownloadResult {
    type: 'REQUEST_DOWNLOAD_RESULT'
  }
}

export default Action
