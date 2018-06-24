import { Map, Set } from 'immutable'
import Annotation from '../types/Annotation'
import { Hint, Slot } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import EditorState from '../types/EditorState'
import Action from '../utils/actions'

export default function editorReducer(state = new EditorState(), action: Action): EditorState {
  if (action.type === 'UPDATE_EDITOR_STATE') {
    return action.updater(state)
  }
  return state
}

export function updateEditorState(
  updater: (editor: EditorState) => EditorState,
): Action.UpdateEditorState {
  return { type: 'UPDATE_EDITOR_STATE', updater }
}

export function setEditorState(editor: EditorState): Action.UpdateEditorState {
  return updateEditorState(() => editor)
}

export function addAnnotations(annotations: Map<string, Annotation>) {
  return updateEditorState(editor => editor.update('annotations', as => as.merge(annotations)))
}

export function addSlots(slots: Map<string, Slot>): Action.UpdateEditorState {
  return updateEditorState(editor => editor.update('slots', ss => ss.merge(slots)))
}

export function addHints(hints: Map<string, Hint>): Action.UpdateEditorState {
  return updateEditorState(editor => editor.update('hints', hs => hs.merge(hints)))
}

export function deleteDecorations(idSet: Set<string>): Action.UpdateEditorState {
  return updateEditorState(editor =>
    editor
      .update('annotations', m => m.filterNot(annotation => idSet.has(annotation.id)))
      .update('hints', hs => hs.filterNot(hint => idSet.has(hint.id)))
      .update('slots', ss => ss.filterNot(slot => idSet.has(slot.id)))
      .update('sel', sel => sel.filterNot(id => idSet.has(id))),
  )
}

export function setSel(sel: Set<string>): Action.UpdateEditorState {
  // 当 sel 变为非空时，自动清空 range
  return updateEditorState(editor =>
    editor.set('sel', sel).set('range', sel.isEmpty() ? editor.range : null),
  )
}

export function setRange(range: DecorationRange): Action.UpdateEditorState {
  return updateEditorState(editor => editor.set('range', range))
}
