import Annotation from '../types/Annotation'
import { inc } from '../utils/common'

export default function adjustOffsets(block: string, annotations: Annotation[]) {
  const adjusted: Annotation[] = []
  const failed: Annotation[] = []
  let shift = 0
  for (const annotation of annotations) {
    const delta = float(annotation.entity, annotation.range.normalize().startOffset)
    if (delta == null) {
      failed.push(annotation)
    } else {
      shift += delta
      adjusted.push(
        annotation.update('range', range =>
          range.update('startOffset', inc(shift)).update('endOffset', inc(shift)),
        ),
      )
    }
  }

  return { adjusted, failed }

  // 应该要以 entity 为准
  function float(entity: string, start: number) {
    for (let delta = 0; delta < 50; delta++) {
      // 往左偏
      const text1 = block.substr(start + shift + delta, entity.length)
      if (entity === text1) {
        return delta
      }

      // 往右偏
      const text2 = block.substr(start + shift - delta, entity.length)
      if (entity === text2) {
        return -delta
      }
    }
    return null
  }
}
