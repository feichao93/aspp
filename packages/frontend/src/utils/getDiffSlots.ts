import { Diff } from './calculateDiffs'

export default function getDiffSlots(diffs: Diff[]) {
  let nextSlotId = 1
  return diffs.map(diff => ({
    type: 'slot' as 'slot',
    id: `slot-${nextSlotId++}`,
    slotType: 'diff',
    range: diff.range,
    data: diff,
  }))
}
