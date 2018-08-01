import { Map } from 'immutable'
import { io } from 'little-saga'
import React from 'react'
import { addHints, deleteDecorations } from '../reducers/editorReducer'
import { Hint } from '../types/Hint'
import { toIdSet } from '../utils/common'
import EditorAction from './EditorAction'

export default class AddHints extends EditorAction {
  constructor(readonly hints: Map<string, Hint>, readonly message: string | JSX.Element) {
    super()
  }

  getMessage() {
    return this.message
  }

  *next() {
    yield io.put(addHints(this.hints))
  }

  *prev() {
    yield io.put(deleteDecorations(toIdSet(this.hints)))
  }
}
