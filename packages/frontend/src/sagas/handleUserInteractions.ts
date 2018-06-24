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
import { applyEditorAction } from './historyManager'

function* handleUserSelectCurrent() {
  const { editor }: State = yield select()
  if (editor.range) {
    const intersected = editor.range.intersected(editor.gather())
    yield applyEditorAction(new SetSel(toIdSet(intersected), SetSelMethod.intersection))
  }
}

function* handleUserSetSel({ sel }: Action.UserSetSel) {
  yield applyEditorAction(new SetSel(sel, SetSelMethod.select))
}

function* handleUserClearSel({ method }: Action.UserClearSel) {
  const { editor }: State = yield select()
  if (!editor.sel.isEmpty()) {
    const setSelMethod = method === 'auto' ? SetSelMethod.autoClear : SetSelMethod.manualClear
    yield applyEditorAction(new SetSel(Set(), setSelMethod))
  }
}

function* handleUserAnnotateCurrent({ tag }: Action.UserAnnotateCurrent) {
  const { editor }: State = yield select()
  if (editor.sel.isEmpty() && editor.range == null) {
    yield put(Action.toast('Invalid selection'))
    return
  }
  const gathered = editor.gather()
  const selection = editor.sel.map(id => gathered.get(id))
  const annotating = editor.sel.isEmpty()
    ? Set.of(
        Annotation.annotateRange(tag, editor.blocks.get(editor.range.blockIndex), editor.range),
      )
    : Annotation.annotateSet(tag, editor.blocks, selection)
  const overlapped = annotating.some(dec1 =>
    gathered.some(dec2 => DecorationRange.isOverlapped(dec1.range, dec2.range)),
  )

  if (overlapped) {
    yield put(Action.toast('Overlap', Intent.WARNING))
    return
  }
  const collector: InteractionCollector = yield getContext('collector')
  if (editor.range) {
    collector.userAnnotateText(editor.range, tag)
  } else {
    collector.userAnnotateSel(editor.sel, tag)
  }
  yield applyEditorAction(new Annotate(keyed(annotating), tag))
}

function* handleUserDeleteCurrent() {
  const collector: InteractionCollector = yield getContext('collector')
  const { editor }: State = yield select()
  const gathered = editor.gather()
  let removing: Map<string, Decoration>
  if (editor.sel.isEmpty()) {
    if (editor.range == null) {
      yield put(Action.toast('invalid range'))
      return
    }
    removing = editor.range.intersected(gathered)
  } else {
    const gathered = editor.gather()
    removing = keyed(editor.sel.map(id => gathered.get(id)))
  }
  if (removing.isEmpty()) {
    return
  }
  collector.userDeleteDecoration(removing.toSet())
  yield applyEditorAction(new DeleteDecorations(removing))
}

function* handleUserAcceptCurrent() {
  const collector: InteractionCollector = yield getContext('collector')
  const { editor }: State = yield select()
  const gathered = editor.gather()
  let accepting: Map<string, Hint>
  if (editor.sel.isEmpty()) {
    if (editor.range == null) {
      accepting = Map()
    } else {
      accepting = editor.range.intersected(gathered).filter(Decoration.isHint)
    }
  } else {
    accepting = keyed(editor.sel.map(id => gathered.get(id)).filter(Decoration.isHint))
  }

  if (accepting.isEmpty()) {
    yield put(Action.toast('No hints to accept'))
    return
  }

  collector.userAcceptHints(accepting.toSet())
  yield applyEditorAction(new AcceptHints(accepting))
}

function* handleUserClickDecoration({ decoration, ctrlKey }: Action.UserClickDecoration) {
  const { editor }: State = yield select()
  const nextSel = ctrlKey ? toggle(editor.sel, decoration.id) : Set.of(decoration.id)
  yield applyEditorAction(new SetSel(nextSel, ctrlKey ? SetSelMethod.toggle : SetSelMethod.select))
}

function* handleUserSelectBlockHints({ blockIndex }: Action.UserSelectBlockHints) {
  const { editor }: State = yield select()
  const selecting = editor.hints.filter(hint => hint.range.blockIndex === blockIndex)
  if (!selecting.isEmpty()) {
    yield applyEditorAction(new SetSel(toIdSet(selecting), SetSelMethod.select))
  }
}

function* handleUserSelectBlockText({ blockIndex }: Action.UserSelectBlockHints) {
  const { editor }: State = yield select()
  const block = editor.blocks.get(blockIndex)
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
