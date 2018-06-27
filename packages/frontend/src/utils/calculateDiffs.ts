import { RawAnnotation } from '../types/Annotation'
import { RawRange } from '../types/DecorationRange'
import { compareArray, compareDecorationPosArray, remove } from './common'
import { RawColl } from './server'

export interface Diff {
  type: 'consistent' | 'partial' | 'conflict'
  range: RawRange
  distribution: Array<[string, RawAnnotation[]]>
}

interface Item {
  collname: string
  annotation: RawAnnotation
}

// TODO 其他应该已经过类似的函数了
export function isSameRange(r1: RawRange, r2: RawRange) {
  return (
    r1.blockIndex === r2.blockIndex &&
    r1.startOffset === r2.startOffset &&
    r1.endOffset === r2.endOffset
  )
}

function extendRange(target: RawRange, source: RawRange) {
  if (DEV_ASSERT) {
    console.assert(
      !(source.startOffset >= target.endOffset || source.endOffset <= target.startOffset),
    )
  }
  target.startOffset = Math.min(target.startOffset, source.startOffset)
  target.endOffset = Math.max(target.endOffset, source.endOffset)
}

export default function calculateDiffs(collEntries: Array<[string, RawColl]>): Diff[] {
  if (DEV_ASSERT) {
    console.assert(collEntries.length >= 2)
  }
  const collnames = collEntries.map(entry => entry[0])
  const items = generateItems()
  const diffs: Diff[] = []

  let currentDiff: Diff = null
  let currentRange: RawRange = null
  let currentTag: string = null
  let lack: string[] = null

  for (const item of items) {
    tryFlush(item)

    if (currentRange == null) {
      // 生成一个默认的diff
      currentRange = Object.assign({}, item.annotation.range)
      currentTag = item.annotation.tag
      currentDiff = {
        type: 'partial',
        range: currentRange,
        distribution: [],
      }
      lack = Array.from(collnames) // shallow-copy the array
    }

    if (item.annotation.tag === currentTag && isSameRange(item.annotation.range, currentRange)) {
      if (DEV_ASSERT) {
        console.assert(currentDiff.type === 'partial' || currentDiff.type === 'conflict')
      }
      if (currentDiff.type === 'partial') {
        if (DEV_ASSERT) {
          console.assert(lack.includes(item.collname))
        }
        remove(lack, item.collname)

        if (lack.length === 0) {
          currentDiff.type = 'consistent'
        }
      } else {
        // currentDiff.type === 'conflict'
        extendRange(currentDiff.range, item.annotation.range)
      }
    } else {
      // 将 partial 转换为 conflict
      currentDiff.type = 'conflict'
      extendRange(currentDiff.range, item.annotation.range)
    }
  }
  flush()

  return diffs

  // region function-definition
  function generateItems() {
    const items: Item[] = []
    for (const [collname, coll] of collEntries) {
      for (const annotation of coll.annotations) {
        items.push({ collname, annotation })
      }
    }
    items.sort((x, y) => compareDecorationPosArray(x.annotation, y.annotation))
    return items
  }

  function tryFlush(item: Item) {
    if (
      currentRange != null &&
      (item.annotation.range.blockIndex !== currentRange.blockIndex ||
        item.annotation.range.startOffset >= currentRange.endOffset)
    ) {
      flush()
    }
  }

  function flush() {
    if (currentDiff != null) {
      calculateDistribution(currentDiff)
      diffs.push(currentDiff)
      currentRange = null
      currentTag = null
      currentDiff = null
    }
  }

  function binarySearchStartIndex(range: RawRange) {
    const diffStart = [range.blockIndex, range.startOffset]

    let low = 0
    let high = items.length - 1
    while (low < high) {
      const middle = Math.floor((low + high) / 2)
      const midRange = items[middle].annotation.range
      const midEnd = [midRange.blockIndex, midRange.endOffset]

      if (compareArray(midEnd, diffStart) > 0) {
        high = middle
      } else {
        low = middle + 1
      }
    }
    if (DEV_ASSERT) {
      console.assert(low === high)
    }
    return low
  }

  function binarySearchEndIndex(range: RawRange) {
    const diffEnd = [range.blockIndex, range.endOffset]
    let low = 0
    let high = items.length - 1
    while (low < high) {
      const middle = Math.ceil((low + high) / 2)
      const midRange = items[middle].annotation.range
      const midStart = [midRange.blockIndex, midRange.startOffset]

      if (compareArray(midStart, diffEnd) < 0) {
        low = middle
      } else {
        high = middle - 1
      }
    }
    if (DEV_ASSERT) {
      console.assert(low === high)
    }
    return low
  }

  function calculateDistribution(diff: Diff) {
    const startIndex = binarySearchStartIndex(diff.range)
    const endIndex = binarySearchEndIndex(diff.range)
    const slice = items.slice(startIndex, endIndex + 1)

    for (const collname of collnames) {
      const annotations = slice
        .filter(item => item.collname === collname)
        .map(item => item.annotation)
      diff.distribution.push([collname, annotations])
    }
  }
  // endregion
}
