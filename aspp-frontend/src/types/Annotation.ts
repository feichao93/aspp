import { Record, Set } from 'immutable'
import { getNextId } from '../utils/common'
import Decoration from './Decoration'
import DecorationRange from './DecorationRange'

const AnnotationRecord = Record({
  id: '',
  type: 'annotation' as 'annotation',
  range: new DecorationRange(),
  confidence: 1,
  tag: '',
})

export default class Annotation extends AnnotationRecord {
  static fromJS(object: any) {
    return new Annotation(object).update('range', DecorationRange.fromJS)
  }

  static tagRange(tag: string, range: DecorationRange) {
    return new Annotation({
      id: getNextId('annotation'),
      tag,
      range,
      confidence: 1,
    })
  }

  static tagSel(tag: string, sel: Set<Decoration>) {
    return sel.map(
      slot =>
        new Annotation({
          tag,
          range: slot.range,
          confidence: 1,
          id: getNextId('annotation'),
        }),
    )
  }
}
