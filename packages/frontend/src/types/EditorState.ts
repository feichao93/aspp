import { List, Map, merge, Record, Seq, Set } from 'immutable'
import DecorationRange from '../types/DecorationRange'
import { keyed } from '../utils/common'
import { RawColl } from '../utils/server'
import Annotation from './Annotation'
import Decoration, { Hint, Slot } from './Decoration'

const EditorStateRecord = Record({
  blocks: List<string>(),
  range: null as DecorationRange,
  sel: Set<string>(),
  annotations: Map<string, Annotation>(),
  slots: Map<string, Slot>(),
  hints: Map<string, Hint>(),
})

function normalizeAnnotationRange(annotation: Annotation) {
  return annotation.update('range', range => range.normalize())
}

function normalizeSlotRange(slot: Slot) {
  return slot.update('range', range => range.normalize())
}

export default class EditorState extends EditorStateRecord {
  static fromJS(object: any) {
    return new EditorState(object)
      .update('blocks', List)
      .update('range', DecorationRange.fromJS)
      .update('sel', Set)
      .update('annotations', annotations => keyed(Seq(annotations).map(Annotation.fromJS)))
      .update('slots', slots => keyed(Seq(slots).map(Slot.fromJS)))
      .update('hints', hints => keyed(Seq(hints).map(Hint.fromJS)))
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

  toRawColl(collname: string): RawColl {
    return {
      name: collname,
      annotations: this.annotations
        .valueSeq()
        .map(normalizeAnnotationRange)
        .toJS(),
      slots: this.slots
        .valueSeq()
        .map(normalizeSlotRange)
        .toJS(),
    }
  }
}
