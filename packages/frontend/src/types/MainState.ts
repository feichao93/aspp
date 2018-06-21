import { List, Map, merge, Record, Seq, Set } from 'immutable'
import DecorationRange from '../types/DecorationRange'
import { keyed } from '../utils/common'
import { DOC_STAT_NAME } from '../utils/constants'
import Annotation from './Annotation'
import Decoration, { Hint, Slot } from './Decoration'

const MainStateRecord = Record({
  docname: '',
  collName: '',
  blocks: List<string>(),
  range: null as DecorationRange,
  sel: Set<string>(),
  annotations: Map<string, Annotation>(),
  slots: Map<string, Slot>(),
  hints: Map<string, Hint>(),
})

type MainStateStatus = 'closed' | 'doc-stat' | 'coll'

export default class MainState extends MainStateRecord {
  static fromJS(object: any) {
    return new MainState(object)
      .update('blocks', List)
      .update('range', DecorationRange.fromJS)
      .update('sel', Set)
      .update('annotations', annotations => keyed(Seq(annotations).map(Annotation.fromJS)))
      .update('slots', slots => keyed(Seq(slots).map(Slot.fromJS)))
      .update('hints', hints => keyed(Seq(hints).map(Hint.fromJS)))
  }

  getStatus(): MainStateStatus {
    if (this.docname === '' && this.collName === '') {
      return 'closed'
    } else if (this.collName === DOC_STAT_NAME) {
      return 'doc-stat'
    } else {
      return 'coll'
    }
  }

  /** 将 Annotation/Slot/Hint 收集到同一个 Map 中 */
  gather(): Map<string, Decoration> {
    return merge<Map<string, Decoration>>(this.annotations, this.slots, this.hints)
  }

  getSelectedText() {
    if (this.range == null) {
      return ''
    } else {
      const normalized = this.range.normalize()
      return this.blocks
        .get(normalized.blockIndex)
        .substring(normalized.startOffset, normalized.endOffset)
    }
  }
}
