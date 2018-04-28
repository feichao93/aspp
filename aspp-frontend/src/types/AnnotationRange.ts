import { Record } from 'immutable'

const AnnotationRangeRecord = Record({
  blockIndex: 0,
  startOffset: 0,
  endOffset: 0,
})

export default class AnnotationRange extends AnnotationRangeRecord {
  static fromJS(object: any) {
    return new AnnotationRange(object)
  }
}
