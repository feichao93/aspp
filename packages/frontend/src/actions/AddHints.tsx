import { Map } from 'immutable'
import { put } from 'little-saga/compat'
import React from 'react'
import { addHints, deleteDecorations } from '../reducers/mainReducer'
import { Hint } from '../types/Decoration'
import { toIdSet } from '../utils/common'
import MainAction from './MainAction'

export default class AddHints extends MainAction {
  constructor(readonly hints: Map<string, Hint>, readonly message: string | JSX.Element) {
    super()
  }

  getMessage() {
    return this.message
  }

  *next() {
    yield put(addHints(this.hints))
  }

  *prev() {
    yield put(deleteDecorations(toIdSet(this.hints)))
  }
}
