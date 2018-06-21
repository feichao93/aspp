import { List, Record, Set } from 'immutable'
import { getNextId } from '../utils/common'
import Decoration from './Decoration'
import DecorationRange, { RawRange } from './DecorationRange'

export interface RawAnnotation {
  id: string
  type: 'annotation'
  range: RawRange
  tag: string
  entity: string
}

const AnnotationRecord = Record({
  id: '',
  type: 'annotation' as 'annotation',
  range: new DecorationRange(),
  tag: '',
  entity: '',
})

export default class Annotation extends AnnotationRecord {
  static fromJS(object: any) {
    return new Annotation(object).update('range', DecorationRange.fromJS)
  }

  /** 对一个 range 打上标签，总是返回新的 Annotation 对象 */
  static annotateRange(tag: string, block: string, range: DecorationRange) {
    return new Annotation({
      id: getNextId('annotation'),
      tag,
      range: range.normalize(),
      entity: range.substring(block),
    })
  }

  /** 对若干 Decoration 打上标签，会尽量复用已有的 Annotation 对象 */
  static annotateSet(tag: string, blocks: List<string>, set: Set<Decoration>) {
    return set.map(
      decoration =>
        Decoration.isAnnotation(decoration)
          ? decoration.set('tag', tag)
          : Annotation.annotateRange(
              tag,
              blocks.get(decoration.range.blockIndex),
              decoration.range,
            ),
    )
  }
}
