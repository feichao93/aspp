import { Set } from 'immutable'
import { channel as makeChannel } from 'little-saga/compat'
import Decoration, { Hint } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'

export type Interaction = Interaction.ALL

export namespace Interaction {
  export type ALL =
    | UserAnnotateText
    | UserAnnotateSel
    | UserDeleteDecorations
    | UserAcceptHints
    | CollOpened
    | UserChangeRange
  // TODO ?? UserCloseAnnotationSet
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

  export interface CollOpened {
    type: 'COLL_OPENED'
    docname: string
    collName: string
  }

  export interface UserChangeRange {
    type: 'USER_CHANGE_RANGE'
    range: DecorationRange
  }
}

export default class InteractionCollector {
  readonly channel = makeChannel()

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

  collOpened(docname: string, collName: string) {
    this.channel.put({ type: 'COLL_OPENED', docname, collName })
  }

  userChangeRange(range: DecorationRange) {
    this.channel.put({ type: 'USER_CHANGE_RANGE', range })
  }
}
