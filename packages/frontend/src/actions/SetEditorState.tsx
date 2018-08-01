import { io } from 'little-saga'
import { State } from '../reducers'
import { setEditorState } from '../reducers/editorReducer'
import EditorState from '../types/EditorState'
import EditorAction from './EditorAction'

export default class SetEditorState extends EditorAction {
  prevState: EditorState

  constructor(readonly nextState: EditorState, readonly message: string) {
    super()
  }

  getMessage() {
    return this.message
  }

  *prepare() {
    const { editor }: State = yield io.select()
    this.prevState = editor
  }

  *prev() {
    yield io.put(setEditorState(this.prevState))
  }

  *next() {
    yield io.put(setEditorState(this.nextState))
  }
}
