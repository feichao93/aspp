import { Record, Set } from 'immutable'
import { shortenText } from '../utils/common'
import AnnotatedDoc from './AnnotatedDoc'
import Annotation from './Annotation'

const DecorationRangeRecord = Record({
  blockIndex: 0,
  startOffset: 0,
  endOffset: 0,
})

/** 文档中一段文本的位置 */
export default class DecorationRange extends DecorationRangeRecord {
  static fromJS(object: any) {
    return new DecorationRange(object)
  }

  /** 从文档中获取 range 对应的文本；range 为 `null` 时，该函数返回空字符串 */
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

  /** 计算与该 range 有重叠的那些 Annotation */
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

  /** 标准化 `startOffset/endOffset` 字段
   * 返回的对象满足条件「`startOffset` 字段小于等于 `endOffset` 字段」
   * */
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

  substring(block: string, shortenLongText = false, maxLen = 15) {
    const normalized = this.normalize()
    const text = block.substring(normalized.startOffset, normalized.endOffset)
    if (shortenLongText) {
      return shortenText(maxLen, text)
    }
    return text
  }
}
