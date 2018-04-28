import { Record } from 'immutable'
import AnnotationRange from './AnnotationRange'

const AnnotationRecord = Record({
  id: '',
  range: new AnnotationRange(),
  confidence: 1,
  tag: '',
})

export default class Annotation extends AnnotationRecord {
  static fromJS(object: any) {
    return new Annotation(object).update('range', AnnotationRange.fromJS)
  }
}
