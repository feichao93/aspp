import EditorAction from './EditorAction'

export default class EmptyEditorAction extends EditorAction {
  constructor(readonly message: string | JSX.Element) {
    super()
  }

  getMessage() {
    return this.message
  }

  *next(): IterableIterator<any> {}
  *prev(): IterableIterator<any> {}
}
