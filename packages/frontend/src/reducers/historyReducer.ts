import EditorHistory from '../types/EditorHistory'
import Action from '../utils/actions'

export default function historyReducer(state = new EditorHistory(), action: Action) {
  if (action.type === 'HISTORY_PUSH') {
    return state
      .update('list', list => list.setSize(state.count).push(action.action))
      .set('count', state.count + 1)
  } else if (action.type === 'HISTORY_CLEAR') {
    return state.update('list', list => list.clear()).set('count', 0)
  } else if (action.type === 'HISTORY_POP') {
    return state.pop()
  } else if (action.type === 'HISTORY_BACK') {
    return state.set('count', Math.max(0, state.count - 1))
  } else if (action.type === 'HISTORY_FORWARD') {
    return state.set('count', Math.min(state.list.count(), state.count + 1))
  } else {
    return state
  }
}
