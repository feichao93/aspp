import { Map } from 'immutable'
import { put } from 'little-saga/compat'
import React from 'react'
import { addSlots, deleteDecorations } from '../reducers/mainReducer'
import { Slot } from '../types/Decoration'
import { toIdSet } from '../utils/common'
import MainAction from './MainAction'

export default class AddSlots extends MainAction {
  constructor(readonly slots: Map<string, Slot>, readonly message: string | JSX.Element) {
    super()
  }

  getMessage() {
    return this.message
  }

  *next() {
    yield put(addSlots(this.slots))
  }

  *prev() {
    yield put(deleteDecorations(toIdSet(this.slots)))
  }
}
