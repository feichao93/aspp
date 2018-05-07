import { Intent, Toaster } from '@blueprintjs/core'
import { List, OrderedSet, Set } from 'immutable'
import { eventChannel } from 'redux-saga'
import { fork, put, select, take, takeEvery } from 'redux-saga/effects'
import { State } from '../reducers'
import Annotation from '../types/Annotation'
import Decoration, { Slot } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import DecorationSet from '../types/DecorationSet'
import { addDecorations, removeDecorations, setRange, setSel, toast } from '../utils/actionCreators'
import Action from '../utils/actions'
import { toggle } from '../utils/common'
import SelectionUtils from '../utils/SelectionUtils'
import shortcutSaga from './shortcutSaga'

function* autoClearNativeSelectionAfterSetSel() {
  while (true) {
    const { sel }: Action.SetSel = yield take('SET_SEL')
    if (!sel.isEmpty()) {
      SelectionUtils.setCurrentRange(null)
    }
  }
}

function* autoClearSelAndUpdateRange() {
  const chan = eventChannel(emit => {
    const callback = () => emit('change')
    document.addEventListener('selectionchange', callback)
    return () => document.removeEventListener('selectionchange', callback)
  })

  try {
    while (true) {
      yield take(chan)
      const { main }: State = yield select()
      const nextRange = SelectionUtils.getCurrentRange()
      if (!main.sel.isEmpty() && nextRange != null) {
        yield put(setSel(OrderedSet()))
      }
      yield put(setRange(nextRange))
    }
  } finally {
    chan.close()
  }
}

function* handleAnnotate({ tag }: Action.Annotate) {
  const { main }: State = yield select()
  if (main.sel.isEmpty() && main.range == null) {
    yield put(toast('Invalid selection'))
    return
  }
  const gathered = main.gather()
  const selDecSet = main.sel.map(id => gathered.get(id))
  const setToAdd = main.sel.isEmpty()
    ? Set.of(Annotation.tagRange(tag, main.range.normalize()))
    : Annotation.tagSel(tag, selDecSet)
  const overlapped = setToAdd.some(dec1 =>
    gathered.some(dec2 => DecorationRange.isOverlapped(dec1.range, dec2.range)),
  )

  if (overlapped) {
    yield put(toast('Overlap'))
  } else {
    yield put(removeDecorations(main.sel))
    yield put(addDecorations(setToAdd.toMap().mapKeys(dec => dec.id)))
    yield put(setSel(setToAdd.map(dec => dec.id).toOrderedSet()))
  }
}

function* handleClearAnnotation() {
  const { main }: State = yield select()
  const gathered = main.gather()
  if (main.sel.isEmpty()) {
    if (main.range == null) {
      yield put(toast('invalid range'))
    } else {
      const removingIdSet = main.range
        .filterIntersected(gathered)
        .keySeq()
        .toSet()
      yield put(removeDecorations(removingIdSet))
    }
  } else {
    yield put(removeDecorations(main.sel))
    // TODO ?? yield put(setSel(()))
  }
}

function* handleClickDecoration({ decoration, ctrlKey }: Action.ClickDecoration) {
  const { main }: State = yield select()
  if (Decoration.isSlot(decoration)) {
    if (decoration.slotType === 'selection') {
      if (ctrlKey) {
        yield put(setSel(toggle(main.sel, decoration.id)))
      }
    }
  } else if (Decoration.isAnnotation(decoration)) {
    if (ctrlKey) {
      yield put(setSel(toggle(main.sel, decoration.id)))
    } else {
      yield put(setSel(Set.of(decoration.id)))
    }
  }
}

// function* handleSelectMatch({ pattern }: Action.SelectMatch) {
//   const { main }: State = yield select()
//   if (typeof pattern === 'string') {
//     const decorationSet = DecorationSet.fromDoc(doc)
//     const matchedSlots = List(doc.plainDoc.blocks)
//       .flatMap((block, blockIndex) =>
//         decorationSet
//           .highlightMatch(block, blockIndex, pattern)
//           .decSet.filter(
//             decoration => Decoration.isSlot(decoration) && decoration.slotType === 'highlight',
//           ),
//       )
//       .map((slot: Slot) => slot.set('slotType', 'selection'))
//     if (matchedSlots.isEmpty()) {
//       yield put(toast('找不到相同的文本'))
//     } else {
//       yield put(setSel(matchedSlots.toSet()))
//     }
//   } else {
//     // RegExp
//     yield put(toast('SelectMatch for RegExp is not implemented'))
//   }
// }

const toaster = Toaster.create()
function handleToast({ message }: Action.Toast) {
  toaster.show({ intent: Intent.PRIMARY, message })
}

function* handleSelectBlockText({ blockIndex }: Action.SelectBlockText) {
  const { main }: State = yield select()
  const block = main.doc.blocks.get(blockIndex)
  SelectionUtils.setCurrentRange(
    new DecorationRange({
      blockIndex,
      startOffset: 0,
      endOffset: block.length,
    }),
  )
}

function* handleClearBlockDecorations({ blockIndex }: Action.ClearBlockDecorations) {
  const { main }: State = yield select()
  const setToRemove = main.gather().filter(dec => dec.range.blockIndex === blockIndex)
  yield put(removeDecorations(setToRemove.keySeq().toSet()))
}

export default function* rootSaga() {
  console.log('root-saga started')
  yield fork(autoClearSelAndUpdateRange)
  yield fork(autoClearNativeSelectionAfterSetSel)
  yield fork(shortcutSaga)

  yield takeEvery('ANNOTATE', handleAnnotate)
  yield takeEvery('CLEAR_ANNOTATION', handleClearAnnotation)
  yield takeEvery('CLICK_DECORATION', handleClickDecoration)
  // yield takeEvery('SELECT_MATCH', handleSelectMatch)
  yield takeEvery('TOAST', handleToast)
  yield takeEvery('SELECT_BLOCK_TEXT', handleSelectBlockText)
  yield takeEvery('CLEAR_BLOCK_DECORATIONS', handleClearBlockDecorations)
}
