import { Map, Set } from 'immutable'
import { io } from 'little-saga'
import React from 'react'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import {
  addAnnotations,
  deleteDecorations,
  setEditorState,
  setSel,
} from '../reducers/editorReducer'
import Annotation from '../types/Annotation'
import EditorState from '../types/EditorState'
import { Hint, HintAction } from '../types/Hint'
import { toIdSet } from '../utils/common'
import EditorAction from './EditorAction'

export default class AcceptHints extends EditorAction {
  prevState: EditorState

  constructor(readonly accepting: Map<string, Hint>) {
    super()
  }

  getMessage() {
    return (
      <span>
        接受
        {this.accepting
          .valueSeq()
          .map((hint, index) => <span key={index}>{Rich.string(hint.message)}</span>)
          .toArray()}
      </span>
    )
  }

  *prepare() {
    const { editor }: State = yield io.select()
    this.prevState = editor
  }

  *prev() {
    yield io.put(setEditorState(this.prevState))
  }

  *next() {
    yield io.put(deleteDecorations(toIdSet(this.accepting)))
    yield handleHintActions(
      this.accepting
        .map(hint => hint.hintAction)
        .filter(Boolean)
        .valueSeq()
        .toArray(),
    )
  }
}

function* handleHintActions(hintActions: HintAction[]) {
  const adding: Annotation[] = []
  for (const hintAction of hintActions) {
    if (hintAction.type === 'hint-add-annotations') {
      adding.push(hintAction.annotation)
    }
  }
  yield io.put(addAnnotations(Map(adding.map(anno => [anno.id, anno] as [string, Annotation]))))
  yield io.put(setSel(Set(adding.map(anno => anno.id))))
}
