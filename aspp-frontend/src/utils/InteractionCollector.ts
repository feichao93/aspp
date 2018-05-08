import { multicastChannel as makeMulticastChannel } from 'redux-saga'
import { delay } from 'redux-saga/utils'
import DecorationRange from '../types/DecorationRange'

export type Interaction = UserAnnotateText

export interface UserAnnotateText {
  type: 'USER_ANNOTATE_TEXT'
  range: DecorationRange
  tag: string
}

export default class InteractionCollector {
  readonly channel = makeMulticastChannel<Interaction>()

  async userAnnotateText(range: DecorationRange, tag: string) {
    await delay(0)
    this.channel.put({ type: 'USER_ANNOTATE_TEXT', range, tag })
  }
}
