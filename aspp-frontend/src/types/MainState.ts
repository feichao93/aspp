import { merge, Map, Set, Record } from 'immutable'
import Annotation from './Annotation'
import Decoration, { Hint, Slot } from './Decoration'
import PlainDoc from './PlainDoc'
import DecorationRange from '../types/DecorationRange'

const MainStateRecord = Record({
  doc: new PlainDoc(),
  range: new DecorationRange(),
  sel: Set<string>(),
  annotations: Map<string, Annotation>(),
  slots: Map<string, Slot>(),
  hints: Map<string, Hint>(),
})

export default class MainState extends MainStateRecord {
  // static fromJS(object: any) {
  //   return new MainState(object)
  //     .update('doc', PlainDoc.fromJS)
  //     .update('range', DecorationRange.fromJS)
  //     .update('sel', OrderedSet)
  //     .update('annotations', annotations => Map(annotations).map(Annotation.fromJS))
  //     .update('slots', slots => Map(slots).map(Slot.fromJS))
  //     .update('hints', hints => Map(hints).map(Hint.fromJS))
  // }

  gather(): Map<string, Decoration> {
    return merge<Map<string, Decoration>>(this.annotations, this.slots, this.hints)
  }

  getSelectedText() {
    return DecorationRange.getText(this.doc, this.range)
  }
}
