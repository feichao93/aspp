import { List, Record } from 'immutable'
import EditorAction from '../actions/EditorAction'

export const emptyAction = Symbol('empty-action')

const EditorHistoryRecord = Record({
  list: List<EditorAction>(),
  count: 0,
})

export default class EditorHistory extends EditorHistoryRecord {
  pop() {
    return this.update('list', list => list.splice(this.count - 1, 1)).update('count', x => x - 1)
  }

  getLastAction() {
    return this.count === 0 ? emptyAction : this.list.get(this.count - 1)
  }

  getNextAction() {
    return this.count >= this.list.size ? emptyAction : this.list.get(this.count)
  }
}
