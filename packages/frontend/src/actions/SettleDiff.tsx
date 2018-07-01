import { Map, Set } from 'immutable'
import { io } from 'little-saga'
import { put, select } from 'little-saga/compat'
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
import { toIdSet } from '../utils/common'
import EditorAction from './EditorAction'

export default class SettleDiff extends EditorAction {
  oldState: EditorState

  constructor(
    readonly slotId: string,
    readonly choice: string,
    readonly annotating: Map<string, Annotation>,
  ) {
    super()
  }

  getMessage() {
    return (
      <span>
        应用来自 {this.choice} 的标注数据：
        {this.annotating
          .map(a => (
            <span key={a.id}>
              <br />
              {Rich.string(a.entity)} -> {a.tag}
            </span>
          ))
          .valueSeq()}
      </span>
    )
  }

  *prepare() {
    const { editor }: State = yield select()
    this.oldState = editor
  }

  *prev() {
    yield put(setEditorState(this.oldState))
  }

  *next() {
    yield io.put(deleteDecorations(Set.of(this.slotId)))
    yield io.put(addAnnotations(this.annotating))
    yield io.put(setSel(toIdSet(this.annotating)))
  }
}
