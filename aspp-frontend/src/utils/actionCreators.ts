import { Set, Map } from 'immutable'
import Decoration from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import Action from './actions'

export function addDecorations(decorations: Map<string, Decoration>): Action.AddDecorations {
  return { type: 'ADD_DECORATIONS', decorations }
}

export function removeDecorations(idSet: Set<string>): Action.RemoveDecorations {
  return { type: 'REMOVE_DECORATIONS', idSet }
}

export function setSel(sel: Set<string>): Action.SetSel {
  return { type: 'SET_SEL', sel }
}

export function selectBlockText(blockIndex: number): Action.SelectBlockText {
  return { type: 'SELECT_BLOCK_TEXT', blockIndex }
}

export function clearBlockDecorations(blockIndex: number): Action.ClearBlockDecorations {
  return { type: 'CLEAR_BLOCK_DECORATIONS', blockIndex }
}

export function setRange(range: DecorationRange): Action.SetRange {
  return { type: 'SET_RANGE', range }
}

export function toast(text: string): Action.Toast {
  return { type: 'TOAST', message: text }
}

// TODO rename to annotateCurrent
export function annotate(tag: string): Action.Annotate {
  return { type: 'ANNOTATE', tag }
}

// TODO rename to deleteCurrentAnnotations
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

export function toggleTaskTreeVisibility(): Action.ToggleTaskTreeVisibility {
  return { type: 'TOGGLE_TASK_TREE_VISIBILITY' }
}
