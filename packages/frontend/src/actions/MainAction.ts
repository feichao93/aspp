export enum ActionCategory {
  interaction = 'interaction',
  task = 'task',
  sideEffects = 'sideEffects',
}

export default abstract class MainAction {
  time = new Date()
  category = ActionCategory.interaction

  abstract prev(): IterableIterator<any>
  abstract next(): IterableIterator<any>

  *prepare(): IterableIterator<any> {}

  getMessage(): string | JSX.Element {
    return this.constructor.name
  }

  withCategory(category: ActionCategory) {
    this.category = category
    return this
  }
}
