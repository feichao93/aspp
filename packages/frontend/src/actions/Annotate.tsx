import { Map } from 'immutable'
import { put, select } from 'little-saga/compat'
import React from 'react'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import { addAnnotations, deleteDecorations, setSel } from '../reducers/mainReducer'
import Annotation from '../types/Annotation'
import Decoration from '../types/Decoration'
import MainState from '../types/MainState'
import { setMainState } from '../utils/actionCreators'
import { shortenText, toIdSet } from '../utils/common'
import MainAction from './MainAction'

export default class Annotate extends MainAction {
  oldState: MainState

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
    const { main }: State = yield select()
    this.oldState = main
  }

  *prev() {
    yield put(setMainState(this.oldState))
  }

  *next() {
    const { main }: State = yield select()
    const gathered = main.gather()
    const selection = main.sel.map(id => gathered.get(id))
    yield put(deleteDecorations(toIdSet(selection.filterNot(Decoration.isAnnotation))))
    yield put(addAnnotations(this.annotating))
    yield put(setSel(toIdSet(this.annotating)))
  }
}
