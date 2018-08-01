import { Map } from 'immutable'
import { io } from 'little-saga'
import React from 'react'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import { deleteDecorations, setEditorState } from '../reducers/editorReducer'
import { Hint } from '../types/Decoration'
import EditorState from '../types/EditorState'
import { toIdSet } from '../utils/common'
import EditorAction from './EditorAction'

export default class AcceptHints extends EditorAction {
  oldState: EditorState

  constructor(readonly accepting: Map<string, Hint>) {
    super()
  }

  getMessage() {
    return (
      <span>
        接受
        {this.accepting
          .valueSeq()
          .map((hint, index) => <span key={index}>{Rich.string(hint.hint)}</span>)
          .toArray()}
      </span>
    )
  }

  *prepare() {
    const { editor }: State = yield io.select()
    this.oldState = editor
  }

  *prev() {
    yield io.put(setEditorState(this.oldState))
  }

  *next() {
    const actions = this.accepting.map(hint => hint.action).filter(Boolean)
    yield io.put(deleteDecorations(toIdSet(this.accepting)))
    // TODO performance degradation
    // 用户可能会一下子选中很多 hint，然后一次性进行接受，这里一个一个处理 action 比较低效
    yield* actions.map(action => io.put(action)).valueSeq()
  }
}
