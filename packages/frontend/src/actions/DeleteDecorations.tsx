import { Map } from 'immutable'
import { io } from 'little-saga'
import React from 'react'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import { addAnnotations, addHints, addSlots, deleteDecorations } from '../reducers/editorReducer'
import Decoration from '../types/Decoration'
import { shortenText, toIdSet } from '../utils/common'
import EditorAction from './EditorAction'

export default class DeleteDecorations extends EditorAction {
  message: JSX.Element

  constructor(readonly removing: Map<string, Decoration>) {
    super()
  }

  getMessage() {
    return this.message
  }

  *prepare() {
    const { editor }: State = yield io.select()
    this.message = (
      <span>
        删除{' '}
        {this.removing
          .valueSeq()
          .map(({ range }) => range.substring(editor.blocks.get(range.blockIndex)))
          .map((text, index) => <span key={index}>{Rich.string(shortenText(15, text))}</span>)
          .toArray()}
        等 {Rich.number(this.removing.count())} 个对象
      </span>
    )
  }

  *prev() {
    yield io.put(addHints(this.removing.filter(Decoration.isHint)))
    yield io.put(addSlots(this.removing.filter(Decoration.isSlot)))
    yield io.put(addAnnotations(this.removing.filter(Decoration.isAnnotation)))
  }

  *next() {
    yield io.put(deleteDecorations(toIdSet(this.removing)))
  }
}
