import { RawAnnotation } from '../types/Annotation'
import Decoration from '../types/Decoration'
import { RawRange } from '../types/DecorationRange'
import { compareArray } from './common'
import { RawColl } from './server'

export type Diff = DiffConsistent | DiffPartial | DiffConflict

export interface DiffConsistent {
  type: 'consistent'
  range: RawRange
}

export interface DiffPartial {
  type: 'partial'
  range: RawRange
  lack: string[]
}

export interface DiffConflict {
  type: 'conflict'
  range: RawRange
}

interface Item {
  key: string
  annotation: RawAnnotation
}

function compareItem(x: Item, y: Item) {
  return compareArray(Decoration.getPosition(x.annotation), Decoration.getPosition(y.annotation))
}

// TODO 其他应该已经过类似的函数了
export function isSameRange(r1: RawRange, r2: RawRange) {
  return (
    r1.blockIndex === r2.blockIndex &&
    r1.startOffset === r2.startOffset &&
    r1.endOffset === r2.endOffset
  )
}

function remove<T>(array: T[], item: T) {
  const index = array.indexOf(item)
  if (index !== -1) {
    array.splice(index, 1)
  }
}

function generateItems(collMap: Map<string, RawColl>) {
  const items: Item[] = []
  for (const [key, coll] of collMap) {
    for (const annotation of coll.annotations) {
      items.push({ key, annotation })
    }
  }
  items.sort(compareItem)
  return items
}

function mergeRange(target: RawRange, source: RawRange) {
  if (DEV_ASSERT) {
    console.assert(
      !(source.startOffset >= target.endOffset || source.endOffset <= target.startOffset),
    )
  }
  target.startOffset = Math.min(target.startOffset, source.startOffset)
  target.endOffset = Math.max(target.endOffset, source.endOffset)
}

export default function calculateDiffs(collMap: Map<string, RawColl>): Diff[] {
  if (DEV_ASSERT) {
    console.assert(collMap.size >= 2)
  }
  const items = generateItems(collMap)

  const diffs: Diff[] = []
  let currentDiff: Diff = null
  let currentRange: RawRange = null
  let currentTag: string = null

  for (const item of items) {
    tryFlush(item)

    if (currentRange == null) {
      // 生成一个默认的diff
      currentRange = item.annotation.range
      currentTag = item.annotation.tag
      currentDiff = {
        type: 'partial',
        range: currentRange,
        // 将所有的 key 都放入 lack 数组中
        lack: Array.from(collMap.keys()),
      }
    }

    if (item.annotation.tag === currentTag && isSameRange(item.annotation.range, currentRange)) {
      if (DEV_ASSERT) {
        console.assert(currentDiff.type === 'partial' || currentDiff.type === 'conflict')
      }
      if (currentDiff.type === 'partial') {
        if (DEV_ASSERT) {
          console.assert(currentDiff.lack.includes(item.key))
        }
        remove(currentDiff.lack, item.key)

        if (currentDiff.lack.length === 0) {
          // 将 partial 转换为 consistent
          currentDiff = {
            type: 'consistent',
            range: currentDiff.range,
          }
        }
      } else {
        // currentDiff.type === 'conflict'
        mergeRange(currentDiff.range, item.annotation.range)
      }
    } else {
      // 将 partial 转换为 conflict
      currentDiff = {
        type: 'conflict',
        range: currentDiff.range,
      }
      mergeRange(currentDiff.range, item.annotation.range)
    }
  }
  flush()

  return diffs

  // region function-definition
  function tryFlush(item: Item) {
    if (currentRange != null && item.annotation.range.startOffset >= currentRange.endOffset) {
      flush()
    }
  }

  function flush() {
    if (currentDiff != null) {
      diffs.push(currentDiff)
      currentRange = null
      currentTag = null
      currentDiff = null
    }
  }
  // endregion
}
