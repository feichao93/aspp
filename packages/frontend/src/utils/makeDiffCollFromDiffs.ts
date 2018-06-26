import { RawAnnotation } from '../types/Annotation'
import DecorationRange from '../types/DecorationRange'
import { Diff } from './calculateDiffs'
import { RawColl } from './server'

export interface DiffData {
  type: 'consistent' | 'partial' | 'conflict'
  distribution: Array<[string, RawAnnotation[]]>
}

function getDiffData(diff: Diff, collMap: Map<string, RawColl>): DiffData {
  const diffRange = new DecorationRange(diff.range)
  const isInDiffRange = (annotation: RawAnnotation) =>
    diffRange.containsRange(new DecorationRange(annotation.range))

  const distribution: Array<[string, RawAnnotation[]]> = []
  for (const [key, coll] of collMap) {
    distribution.push([key, coll.annotations.filter(isInDiffRange)])
  }
  return { type: diff.type, distribution }
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
