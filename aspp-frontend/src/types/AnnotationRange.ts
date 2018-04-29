import { Set, Record } from 'immutable'
import Annotation from './Annotation'

const AnnotationRangeRecord = Record({
  blockIndex: 0,
  startOffset: 0,
  endOffset: 0,
})

export default class AnnotationRange extends AnnotationRangeRecord {
  static fromJS(object: any) {
    return new AnnotationRange(object)
  }

  intersect(annotationSet: Set<Annotation>): Set<Annotation> {
    return annotationSet.filter(annotation => {
      const { blockIndex, startOffset, endOffset } = annotation.range
      return (
        blockIndex === this.blockIndex &&
        startOffset < this.endOffset &&
        endOffset > this.startOffset
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

  getSelectedText(block: string) {
    const normalized = this.normalize()
    return block.substring(normalized.startOffset, normalized.endOffset)
  }
}
