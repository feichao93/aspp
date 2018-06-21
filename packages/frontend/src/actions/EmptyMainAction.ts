import MainAction from './MainAction'

export default class EmptyMainAction extends MainAction {
  constructor(readonly message: string | JSX.Element) {
    super()
  }

  getMessage() {
    return this.message
  }

  *next(): IterableIterator<any> {}
  *prev(): IterableIterator<any> {}
}
