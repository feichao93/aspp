import { Record } from 'immutable'
import DecorationRange from './DecorationRange'

const AnnotationRecord = Record({
  id: '',
  range: new DecorationRange(),
  confidence: 1,
  tag: '',
})

export default class Annotation extends AnnotationRecord {
  static fromJS(object: any) {
    return new Annotation(object).update('range', DecorationRange.fromJS)
  }
}
