import { merge, Map, Set, Record, List } from 'immutable'
import Annotation from './Annotation'
import Decoration, { Hint, Slot } from './Decoration'
import DecorationRange from '../types/DecorationRange'

const MainStateRecord = Record({
  docname: '',
  annotationSetName: '',
  altered: false,
  blocks: List<string>(),
  range: null as DecorationRange,
  sel: Set<string>(),
  annotations: Map<string, Annotation>(),
  slots: Map<string, Slot>(),
  hints: Map<string, Hint>(),
})

export default class MainState extends MainStateRecord {
  static fromJS(object: any) {
    return new MainState(object)
      .update('blocks', List)
      .update('range', DecorationRange.fromJS)
      .update('sel', Set)
      .update('annotations', annotations => Map(annotations).map(Annotation.fromJS))
      .update('slots', slots => Map(slots).map(Slot.fromJS))
      .update('hints', hints => Map(hints).map(Hint.fromJS))
  }

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
