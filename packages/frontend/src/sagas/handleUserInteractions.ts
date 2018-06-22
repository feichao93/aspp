import { Intent } from '@blueprintjs/core'
import { Map, Set } from 'immutable'
import { getContext, put, select, takeEvery } from 'little-saga/compat'
import AcceptHints from '../actions/AcceptHints'
import Annotate from '../actions/Annotate'
import DeleteDecorations from '../actions/DeleteDecorations'
import SetSel, { SetSelMethod } from '../actions/SetSel'
import { State } from '../reducers'
import Annotation from '../types/Annotation'
import Decoration, { Hint } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import Action from '../utils/actions'
import { a, keyed, toggle, toIdSet } from '../utils/common'
import InteractionCollector from '../utils/InteractionCollector'
import SelectionUtils from '../utils/SelectionUtils'
import { applyMainAction } from './historyManager'

function* handleUserSelectCurrent() {
  const { main }: State = yield select()
  if (main.range) {
    const intersected = main.range.intersected(main.gather())
    yield applyMainAction(new SetSel(toIdSet(intersected), SetSelMethod.intersection))
  }
}

function* handleUserSetSel({ sel }: Action.UserSetSel) {
  yield applyMainAction(new SetSel(sel, SetSelMethod.select))
}

function* handleUserClearSel({ method }: Action.UserClearSel) {
  const { main }: State = yield select()
  if (!main.sel.isEmpty()) {
    const setSelMethod = method === 'auto' ? SetSelMethod.autoClear : SetSelMethod.manualClear
    yield applyMainAction(new SetSel(Set(), setSelMethod))
  }
}

function* handleUserAnnotateCurrent({ tag }: Action.UserAnnotateCurrent) {
  const { main }: State = yield select()
  if (main.sel.isEmpty() && main.range == null) {
    yield put(Action.toast('Invalid selection'))
    return
  }
  const gathered = main.gather()
  const selection = main.sel.map(id => gathered.get(id))
  const annotating = main.sel.isEmpty()
    ? Set.of(Annotation.annotateRange(tag, main.blocks.get(main.range.blockIndex), main.range))
    : Annotation.annotateSet(tag, main.blocks, selection)
  const overlapped = annotating.some(dec1 =>
    gathered.some(dec2 => DecorationRange.isOverlapped(dec1.range, dec2.range)),
  )

  if (overlapped) {
    yield put(Action.toast('Overlap', Intent.WARNING))
    return
  }
  const collector: InteractionCollector = yield getContext('collector')
  if (main.range) {
    collector.userAnnotateText(main.range, tag)
  } else {
    collector.userAnnotateSel(main.sel, tag)
  }
  yield applyMainAction(new Annotate(keyed(annotating), tag))
}

function* handleUserDeleteCurrent() {
  const collector: InteractionCollector = yield getContext('collector')
  const { main }: State = yield select()
  const gathered = main.gather()
  let removing: Map<string, Decoration>
  if (main.sel.isEmpty()) {
    if (main.range == null) {
      yield put(Action.toast('invalid range'))
      return
    }
    removing = main.range.intersected(gathered)
  } else {
    const gathered = main.gather()
    removing = keyed(main.sel.map(id => gathered.get(id)))
  }
  if (removing.isEmpty()) {
    return
  }
  collector.userDeleteDecoration(removing.toSet())
  yield applyMainAction(new DeleteDecorations(removing))
}

function* handleUserAcceptCurrent() {
  const collector: InteractionCollector = yield getContext('collector')
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
    yield put(Action.toast('No hints to accept'))
    return
  }

  collector.userAcceptHints(accepting.toSet())
  yield applyMainAction(new AcceptHints(accepting))
}

function* handleUserClickDecoration({ decoration, ctrlKey }: Action.UserClickDecoration) {
  const { main }: State = yield select()
  const nextSel = ctrlKey ? toggle(main.sel, decoration.id) : Set.of(decoration.id)
  yield applyMainAction(new SetSel(nextSel, ctrlKey ? SetSelMethod.toggle : SetSelMethod.select))
}

function* handleUserSelectBlockHints({ blockIndex }: Action.UserSelectBlockHints) {
  const { main }: State = yield select()
  const selecting = main.hints.filter(hint => hint.range.blockIndex === blockIndex)
  if (!selecting.isEmpty()) {
    yield applyMainAction(new SetSel(toIdSet(selecting), SetSelMethod.select))
  }
}

function* handleUserSelectBlockText({ blockIndex }: Action.UserSelectBlockHints) {
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

export default function* handleUserInteractions() {
  yield takeEvery(a('USER_SELECT_CURRENT'), handleUserSelectCurrent)
  yield takeEvery(a('USER_SET_SEL'), handleUserSetSel)
  yield takeEvery(a('USER_CLEAR_SEL'), handleUserClearSel)
  yield takeEvery(a('USER_ANNOTATE_CURRENT'), handleUserAnnotateCurrent)
  yield takeEvery(a('USER_DELETE_CURRENT'), handleUserDeleteCurrent)
  yield takeEvery(a('USER_ACCEPT_CURRENT'), handleUserAcceptCurrent)
  yield takeEvery(a('USER_CLICK_DECORATION'), handleUserClickDecoration)
  yield takeEvery(a('USER_SELECT_BLOCK_HINTS'), handleUserSelectBlockHints)
  yield takeEvery(a('USER_SELECT_BLOCK_TEXT'), handleUserSelectBlockText)
}
