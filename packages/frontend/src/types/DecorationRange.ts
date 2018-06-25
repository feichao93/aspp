import { Map, Record } from 'immutable'
import { shortenText } from '../utils/common'
import Decoration from './Decoration'

export interface RawRange {
  blockIndex: number
  startOffset: number
  endOffset: number
}

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

  static isIntersected(r1: DecorationRange, r2: DecorationRange) {
    r1 = r1.normalize()
    r2 = r2.normalize()
    return (
      r1.blockIndex === r2.blockIndex &&
      r1.startOffset < r2.endOffset &&
      r1.endOffset > r2.startOffset
    )
  }

  static isOverlapped(r1: DecorationRange, r2: DecorationRange) {
    return DecorationRange.isIntersected(r1, r2) && !r1.containsRange(r2) && !r2.containsRange(r1)
  }

  containsRange(other: DecorationRange) {
    const r1 = this.normalize()
    const r2 = other.normalize()
    return (
      r1.blockIndex === r2.blockIndex &&
      r1.startOffset <= r2.startOffset &&
      r1.endOffset >= r2.endOffset
    )
  }

  /** 计算与该 range 有重叠的那些 Decorations */
  intersected(annotations: Map<string, Decoration>): Map<string, Decoration> {
    const normalized = this.normalize()
    return annotations.filter(annotation => {
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

  // TODO 将 shortenText 的功能移动到其他地方
  substring(block: string, shortenLongText = false, maxLen = 14) {
    const normalized = this.normalize()
    const text = block.substring(normalized.startOffset, normalized.endOffset)
    if (shortenLongText) {
      return shortenText(maxLen, text)
    }
    return text
  }
}
