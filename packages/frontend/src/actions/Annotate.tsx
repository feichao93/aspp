import { Map } from 'immutable'
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
import Decoration from '../types/Decoration'
import EditorState from '../types/EditorState'
import { shortenText, toIdSet } from '../utils/common'
import EditorAction from './EditorAction'

export default class Annotate extends EditorAction {
  oldState: EditorState

  constructor(
    readonly annotating: Map<string, Annotation>,
    readonly tag: string,
    readonly origin = '',
  ) {
    super()
  }

  getMessage() {
    return (
      <span>
        {this.origin ? `${this.origin} ` : ''}
        将
        {this.annotating
          .map(ann => ann.entity)
          .map((text, index) => <span key={index}>{Rich.string(shortenText(15, text))}</span>)
          .valueSeq()}
        标记为
        <b>{this.tag}</b>
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
    const { editor }: State = yield select()
    const gathered = editor.gather()
    const selection = editor.sel.map(id => gathered.get(id))
    yield put(deleteDecorations(toIdSet(selection.filterNot(Decoration.isAnnotation))))
    yield put(addAnnotations(this.annotating))
    yield put(setSel(toIdSet(this.annotating)))
  }
}
