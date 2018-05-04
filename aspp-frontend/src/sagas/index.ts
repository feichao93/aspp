import { Intent, Toaster } from '@blueprintjs/core'
import { List, Set } from 'immutable'
import { eventChannel } from 'redux-saga'
import { fork, put, select, take, takeEvery } from 'redux-saga/effects'
import { State } from '../reducer'
import Annotation from '../types/Annotation'
import Decoration, { Slot } from '../types/Decoration'
import DecorationSet from '../types/DecorationSet'
import { addAnnotationSet, removeAnnotationSet, setRange, setSel, toast, } from '../utils/actionCreators'
import Action from '../utils/actions'
import { toggle } from '../utils/common'
import SelectionUtils from '../utils/SelectionUtils'

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
      const { sel }: State = yield select()
      const nextRange = SelectionUtils.getCurrentRange()
      if (!sel.isEmpty() && nextRange != null) {
        yield put(setSel(Set()))
      }
      yield put(setRange(nextRange))
    }
  } finally {
    chan.close()
  }
}

function* handleAnnotate({ tag }: Action.Annotate) {
  const { sel, range }: State = yield select()
  if (sel.isEmpty()) {
    if (range == null) {
      yield put(toast('invalid selection'))
    } else {
      const annotation = Annotation.tagRange(tag, range.normalize())
      yield put(addAnnotationSet(Set.of(annotation)))
    }
  } else {
    yield put(addAnnotationSet(Annotation.tagSel(tag, sel)))
    yield put(setSel(Set()))
  }
}

function* handleClearAnnotation() {
  console.log('clear annotation!')
  const { sel, doc, range }: State = yield select()
  if (sel.isEmpty()) {
    if (range == null) {
      yield put(toast('invalid range'))
    } else {
      yield put(removeAnnotationSet(range.intersect(doc.annotationSet)))
    }
  } else {
    yield put(
      removeAnnotationSet(
        sel.filter(Decoration.isAnnotation).map(decoration => decoration.annotation),
      ),
    )
    yield put(setSel(Set()))
  }
}

function* handleClickDecoration({ decoration, ctrlKey }: Action.ClickDecoration) {
  const { sel }: State = yield select()
  if (Decoration.isSlot(decoration)) {
    if (decoration.slotType === 'selection') {
      if (ctrlKey) {
        yield put(setSel(toggle(sel, decoration)))
      }
    }
  } else if (Decoration.isAnnotation(decoration)) {
    if (ctrlKey) {
      yield put(setSel(toggle(sel, decoration)))
    } else {
      yield put(setSel(Set.of(decoration)))
    }
  }
}

function* handleSelectMatch({ pattern }: Action.SelectMatch) {
  const { doc }: State = yield select()
  if (typeof pattern === 'string') {
    const decorationSet = DecorationSet.fromDoc(doc)
    const matchedSlots = List(doc.plainDoc.blocks)
      .flatMap((block, blockIndex) =>
        decorationSet
          .highlightMatch(block, blockIndex, pattern)
          .decSet.filter(
            decoration => Decoration.isSlot(decoration) && decoration.slotType === 'highlight',
          ),
      )
      .map((slot: Slot) => slot.set('slotType', 'selection'))
    if (matchedSlots.isEmpty()) {
      yield put(toast('找不到相同的文本'))
    } else {
      yield put(setSel(matchedSlots.toSet()))
    }
  } else {
    // RegExp
    yield put(toast('SelectMatch for RegExp is not implemented'))
  }
}

const toaster = Toaster.create()
function handleToast({ message }: Action.Toast) {
  toaster.show({ intent: Intent.PRIMARY, message })
}

export default function* rootSaga() {
  console.log('root-saga started')
  yield fork(autoClearSelAndUpdateRange)
  yield fork(autoClearNativeSelectionAfterSetSel)
  yield takeEvery('ANNOTATE', handleAnnotate)
  yield takeEvery('CLEAR_ANNOTATION', handleClearAnnotation)
  yield takeEvery('CLICK_DECORATION', handleClickDecoration)
  yield takeEvery('SELECT_MATCH', handleSelectMatch)
  yield takeEvery('TOAST', handleToast)
}
