import { RawAnnotation } from '../types/Annotation'
import DecorationRange from '../types/DecorationRange'
import { Diff, isSameRange } from './calculateDiffs'
import { RawColl } from './server'

export type DiffData = DiffDataConsistent | DiffDataPartial | DiffDataConflict

export interface DiffDataConsistent {
  type: 'consistent'
  annotation: RawAnnotation
}

export interface DiffDataPartial {
  type: 'partial'
  annotation: RawAnnotation
  lack: string[]
}

export interface DiffDataConflict {
  type: 'conflict'
  annotationMap: Map<string, RawAnnotation[]>
}

function getDiffData(diff: Diff, collMap: Map<string, RawColl>): DiffData {
  if (diff.type === 'consistent') {
    const coll = getFirstNonEmptyColl()
    const annotation = coll.annotations.find(anno => isSameRange(anno.range, diff.range))
    return { type: 'consistent', annotation }
  } else if (diff.type === 'partial') {
    const coll = getFirstNonEmptyColl(diff.lack)
    const annotation = coll.annotations.find(anno => isSameRange(anno.range, diff.range))
    return { type: 'partial', annotation, lack: diff.lack }
  } else {
    const diffRange = new DecorationRange(diff.range)
    const annotationMap = new Map<string, RawAnnotation[]>()
    for (const [key, coll] of collMap) {
      annotationMap.set(
        key,
        coll.annotations.filter(anno => {
          const range = new DecorationRange(anno.range)
          return range.containsRange(diffRange)
        }),
      )
    }
    return { type: 'conflict', annotationMap }
  }

  function getFirstNonEmptyColl(lack: string[] = []) {
    for (const key of collMap.keys()) {
      if (!lack.includes(key)) {
        return collMap.get(key)
      }
    }
    throw new Error()
  }
}

export default function makeDiffCollFromDiffs(
  diffs: Diff[],
  collMap: Map<string, RawColl>,
): RawColl {
  let nextId = 1
  const slots = diffs.map(diff => ({
    type: 'slot' as 'slot',
    id: `slot-${nextId++}`,
    slotType: 'diff',
    range: diff.range,
    data: getDiffData(diff, collMap),
  }))

  return { name: 'diff', annotations: [], slots }
}
