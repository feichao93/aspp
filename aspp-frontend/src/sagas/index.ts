import { Intent, Toaster } from '@blueprintjs/core'
import { is, Map, Set } from 'immutable'
import { eventChannel } from 'redux-saga'
import { fork, put, select, take, takeEvery } from 'redux-saga/effects'
import { State } from '../reducers'
import Annotation from '../types/Annotation'
import Decoration, { Hint } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import {
  acceptHints,
  addAnnotations,
  deleteDecorations,
  setRange,
  setSel,
  toast,
} from '../utils/actionCreators'
import Action from '../utils/actions'
import { keyed, toggle, toIdSet } from '../utils/common'
import InteractionCollector from '../utils/InteractionCollector'
import SelectionUtils from '../utils/SelectionUtils'
import fileSaga from './fileSaga'
import handleInteractions from './handleInteractions'
import handleSelectMatch from './handleSelectMatch'
import shortcutSaga from './shortcutSaga'

function* autoClearNativeSelectionAfterSetSel() {
  while (true) {
    const { sel }: Action.SetSel = yield take('R_SET_SEL')
    if (!sel.isEmpty()) {
      SelectionUtils.setCurrentRange(null)
    }
  }
}

function* autoClearSelAndUpdateRange(collector: InteractionCollector) {
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
        yield put(setSel(Set()))
      }
      if (!is(main.range, nextRange)) {
        yield put(setRange(nextRange))
        collector.userChangeRange(nextRange)
      }
    }
  } finally {
    chan.close()
  }
}

function* handleAnnotateCurrent(collector: InteractionCollector, { tag }: Action.AnnotateCurrent) {
  const { main }: State = yield select()
  if (main.sel.isEmpty() && main.range == null) {
    yield put(toast('Invalid selection'))
    return
  }
  const gathered = main.gather()
  const selection = main.sel.map(id => gathered.get(id))
  const adding = main.sel.isEmpty()
    ? Set.of(Annotation.annotateRange(tag, main.range))
    : Annotation.annotateSet(tag, selection)
  const overlapped = adding.some(dec1 =>
    gathered.some(dec2 => DecorationRange.isOverlapped(dec1.range, dec2.range)),
  )

  if (overlapped) {
    yield put(toast('Overlap'))
  } else {
    if (main.range) {
      collector.userAnnotateText(main.range, tag)
    } else {
      collector.userAnnotateSel(main.sel, tag)
    }
    yield put(deleteDecorations(toIdSet(selection.filterNot(Decoration.isAnnotation))))
    yield put(addAnnotations(keyed(adding)))
    yield put(setSel(toIdSet(adding)))
  }
}

function* handleDeleteCurrent(collector: InteractionCollector) {
  const { main }: State = yield select()
  const gathered = main.gather()
  if (main.sel.isEmpty()) {
    if (main.range == null) {
      yield put(toast('invalid range'))
    } else {
      const removing = main.range.intersected(gathered)
      collector.userDeleteDecoration(removing.toSet())
      yield put(deleteDecorations(toIdSet(removing)))
    }
  } else {
    yield put(deleteDecorations(main.sel))
  }
}

function* handleAcceptCurrent(collector: InteractionCollector) {
  const { main }: State = yield select()
  const gathered = main.gather()
  let accepting: Map<string, Hint>
  if (main.sel.isEmpty()) {
    if (main.range == null) {
      accepting = Map()
    } else {
      accepting = main.range.intersected(gathered).filter(Decoration.isHint)
    }
  } else {
    accepting = keyed(main.sel.map(id => gathered.get(id)).filter(Decoration.isHint))
  }

  if (accepting.isEmpty()) {
    yield put(toast('No hints to accept'))
  } else {
    collector.userAcceptHints(accepting.toSet())
    yield put(acceptHints(accepting))
  }
}

function* handleAcceptHints({ accepting }: Action.AcceptHints) {
  if (accepting.isEmpty()) {
    yield put(toast('No hints to accept'))
  } else {
    const actions = accepting.map(hint => hint.action).filter(Boolean)
    yield put(deleteDecorations(toIdSet(accepting)))
    // TODO performance degradation
    // 用户可能会一下子选中很多 hint，然后一次性进行接受，这里一个一个处理 action 比较低效
    yield* actions.map(action => put(action)).valueSeq()
  }
}

function* handleClickDecoration({ decoration, ctrlKey }: Action.ClickDecoration) {
  const { main }: State = yield select()
  if (ctrlKey) {
    yield put(setSel(toggle(main.sel, decoration.id)))
  } else {
    yield put(setSel(Set.of(decoration.id)))
  }
}

const toaster = Toaster.create()
function handleToast({ message, intent = Intent.PRIMARY }: Action.Toast) {
  toaster.show({ intent, message })
}

function* handleSelectBlockText({ blockIndex }: Action.SelectBlockText) {
  const { main }: State = yield select()
  const block = main.blocks.get(blockIndex)
  SelectionUtils.setCurrentRange(
    new DecorationRange({
      blockIndex,
      startOffset: 0,
      endOffset: block.length,
    }),
  )
}

function* handleAcceptBlock(collector: InteractionCollector, { blockIndex }: Action.AcceptBlock) {
  const { main }: State = yield select()
  const accepting = main.hints.filter(dec => dec.range.blockIndex === blockIndex)
  if (!accepting.isEmpty()) {
    collector.userAcceptHints(accepting.toSet())
    yield put(acceptHints(accepting))
  }
}

function* handleClearBlockDecorations(
  collector: InteractionCollector,
  { blockIndex }: Action.ClearBlockDecorations,
) {
  const { main }: State = yield select()
  const removing = main.gather().filter(dec => dec.range.blockIndex === blockIndex)
  collector.userDeleteDecoration(removing.toSet())
  yield put(deleteDecorations(toIdSet(removing)))
}

export default function* rootSaga() {
  const collector = new InteractionCollector()

  console.log('root-saga started')
  yield fork(autoClearSelAndUpdateRange, collector)
  yield fork(autoClearNativeSelectionAfterSetSel)
  yield fork(shortcutSaga)
  yield fork(handleInteractions, collector)
  yield fork(fileSaga)

  yield takeEvery('ANNOTATE_CURRENT', handleAnnotateCurrent, collector)
  yield takeEvery('DELETE_CURRENT', handleDeleteCurrent, collector)
  yield takeEvery('ACCEPT_CURRENT', handleAcceptCurrent, collector)
  yield takeEvery('CLICK_DECORATION', handleClickDecoration)
  yield takeEvery('SELECT_MATCH', handleSelectMatch)
  yield takeEvery('TOAST', handleToast)
  yield takeEvery('SELECT_BLOCK_TEXT', handleSelectBlockText)
  yield takeEvery('ACCEPT_BLOCK', handleAcceptBlock, collector)
  yield takeEvery('CLEAR_BLOCK_DECORATIONS', handleClearBlockDecorations, collector)
  yield takeEvery('ACCEPT_HINTS', handleAcceptHints)
}
