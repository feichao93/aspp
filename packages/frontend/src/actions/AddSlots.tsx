import { Map } from 'immutable'
import { io } from 'little-saga'
import React from 'react'
import { addSlots, deleteDecorations } from '../reducers/editorReducer'
import { Slot } from '../types/Decoration'
import { toIdSet } from '../utils/common'
import EditorAction from './EditorAction'

export default class AddSlots extends EditorAction {
  constructor(readonly slots: Map<string, Slot>, readonly message: string | JSX.Element) {
    super()
  }

  getMessage() {
    return this.message
  }

  *next() {
    yield io.put(addSlots(this.slots))
  }

  *prev() {
    yield io.put(deleteDecorations(toIdSet(this.slots)))
  }
}
