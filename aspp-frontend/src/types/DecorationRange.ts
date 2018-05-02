import { Record, Set } from 'immutable'
import AnnotatedDoc from './AnnotatedDoc'
import Annotation from './Annotation'

const DecorationRangeRecord = Record({
  blockIndex: 0,
  startOffset: 0,
  endOffset: 0,
})

export default class DecorationRange extends DecorationRangeRecord {
  static fromJS(object: any) {
    return new DecorationRange(object)
  }

  static getText(doc: AnnotatedDoc, range: DecorationRange) {
    if (range == null) {
      return ''
    } else {
      const normalized = range.normalize()
      return doc.plainDoc.blocks
        .get(normalized.blockIndex)
        .substring(normalized.startOffset, normalized.endOffset)
    }
  }

  intersect(annotationSet: Set<Annotation>): Set<Annotation> {
    const normalized = this.normalize()
    return annotationSet.filter(annotation => {
      const { blockIndex, startOffset, endOffset } = annotation.range
      return (
        blockIndex === normalized.blockIndex &&
        startOffset < normalized.endOffset &&
        endOffset > normalized.startOffset
      )
    })
  }

  normalize() {
    if (this.startOffset > this.endOffset) {
      return this.merge({
        startOffset: this.endOffset,
        endOffset: this.startOffset,
      })
    } else {
      return this
    }
  }
}
