import { List, Map } from 'immutable'
import { put, select } from 'redux-saga/effects'
import { State } from '../reducers'
import Decoration, { Slot } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import { addDecorations, setSel, toast } from '../utils/actionCreators'
import Action from '../utils/actions'
import { keyed, toIdSet } from '../utils/common'

function findMatch(
  block: string,
  blockIndex: number,
  decorations: Map<string, Decoration>,
  text: string,
): DecorationRange[] {
  const result: DecorationRange[] = []
  if (text.length === 0) {
    return result
  }
  let i = 0
  while (true) {
    const nextIndex = block.indexOf(text, i)
    if (nextIndex === -1) {
      break
    }
    const range = new DecorationRange({
      blockIndex,
      startOffset: nextIndex,
      endOffset: nextIndex + text.length,
    })
    const occupied = decorations.some(dec => DecorationRange.isOverlapped(dec.range, range))
    if (!occupied) {
      result.push(range)
    }
    i = nextIndex + text.length
  }
  return result
}

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
