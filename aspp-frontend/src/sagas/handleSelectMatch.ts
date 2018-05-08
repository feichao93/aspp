import { List } from 'immutable'
import { put, select } from 'redux-saga/effects'
import { State } from '../reducers'
import { Slot } from '../types/Decoration'
import { addDecorations, setSel, toast } from '../utils/actionCreators'
import Action from '../utils/actions'
import { keyed, toIdSet } from '../utils/common'
import findMatch from '../utils/findMatch'

export default function* handleSelectMatch({ pattern }: Action.SelectMatch) {
  const { main }: State = yield select()
  if (typeof pattern === 'string') {
    let gathered = main.gather()
    const slots = keyed(
      List(main.doc.blocks)
        .flatMap((block, blockIndex) => findMatch(block, blockIndex, gathered, pattern))
        .map(Slot.match),
    )

    if (slots.isEmpty()) {
      yield put(toast('找不到相同的文本'))
    } else {
      yield put(addDecorations(slots))
      yield put(setSel(toIdSet(slots)))
    }
  } else {
    // RegExp
    yield put(toast('SelectMatch for RegExp is not implemented'))
  }
}
