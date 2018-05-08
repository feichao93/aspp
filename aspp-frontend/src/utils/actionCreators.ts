import { Map, Set } from 'immutable'
import Decoration, { Hint } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import Action from './actions'

export function addDecorations(decorations: Map<string, Decoration>): Action.AddDecorations {
  return { type: 'R_ADD_DECORATIONS', decorations}
}

export function removeDecorations(idSet: Set<string>): Action.RemoveDecorations {
  return { type: 'R_REMOVE_DECORATIONS', idSet }
}

export function setSel(sel: Set<string>): Action.SetSel {
  return { type: 'R_SET_SEL', sel }
}

export function selectBlockText(blockIndex: number): Action.SelectBlockText {
  return { type: 'SELECT_BLOCK_TEXT', blockIndex }
}

export function acceptBlock(blockIndex: number): Action.AcceptBlock {
  return { type: 'ACCEPT_BLOCK', blockIndex }
}

export function clearBlockDecorations(blockIndex: number): Action.ClearBlockDecorations {
  return { type: 'CLEAR_BLOCK_DECORATIONS', blockIndex }
}

export function setRange(range: DecorationRange): Action.SetRange {
  return { type: 'R_SET_RANGE', range }
}

export function toast(text: string): Action.Toast {
  return { type: 'TOAST', message: text }
}

export function annotateCurrent(tag: string): Action.AnnotateCurrent {
  return { type: 'ANNOTATE_CURRENT', tag }
}

export function deleteCurrent(): Action.DeleteCurrent {
  return { type: 'DELETE_CURRENT' }
}

export function acceptCurrent(): Action.AcceptCurrent {
  return { type: 'ACCEPT_CURRENT' }
}

export function clickDecoration(decoration: Decoration, ctrlKey: boolean): Action.ClickDecoration {
  return { type: 'CLICK_DECORATION', decoration, ctrlKey }
}

export function selectMatch(pattern: string | RegExp): Action.SelectMatch {
  return { type: 'SELECT_MATCH', pattern }
}

export function toggleDarkTheme(): Action.ToggleDarkTheme {
  return { type: 'R_TOGGLE_DARK_THEME' }
}

export function toggleTaskTreeVisibility(): Action.ToggleTaskTreeVisibility {
  return { type: 'R_TOGGLE_TASK_TREE_VISIBILITY' }
}

export function acceptHints(accepting: Map<string, Hint>): Action.AcceptHints {
  return { type: 'ACCEPT_HINTS', accepting }
}
