import { Set } from 'immutable'
import { channel as makeChannel } from 'redux-saga'
import Decoration, { Hint } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'

export type Interaction =
  | UserAnnotateText
  | UserAnnotateSel
  | UserDeleteDecorations
  | UserAcceptHints
  | UserChangeRange
// TODO userOpenDoc
// TODO userCloseDoc
// TODO ?? userRequestHint

export interface UserAnnotateText {
  type: 'USER_ANNOTATE_TEXT'
  range: DecorationRange
  tag: string
}

export interface UserAnnotateSel {
  type: 'USER_ANNOTATE_SEL'
  sel: Set<string>
  tag: string
}

export interface UserDeleteDecorations {
  type: 'USER_DELETE_DECORATIONS'
  set: Set<Decoration>
}

export interface UserAcceptHints {
  type: 'USER_ACCEPT_HINTS'
  set: Set<Hint>
}

export interface UserChangeRange {
  type: 'USER_CHANGE_RANGE'
  range: DecorationRange
}

export default class InteractionCollector {
  readonly channel = makeChannel<Interaction>()

  userAnnotateText(range: DecorationRange, tag: string) {
    this.channel.put({ type: 'USER_ANNOTATE_TEXT', range, tag })
  }

  userDeleteDecoration(set: Set<Decoration>) {
    this.channel.put({ type: 'USER_DELETE_DECORATIONS', set })
  }

  userAnnotateSel(sel: Set<string>, tag: string) {
    this.channel.put({ type: 'USER_ANNOTATE_SEL', sel, tag })
  }

  userAcceptHints(set: Set<Hint>) {
    this.channel.put({ type: 'USER_ACCEPT_HINTS', set })
  }

  userChangeRange(range: DecorationRange) {
    this.channel.put({ type: 'USER_CHANGE_RANGE', range })
  }
}
