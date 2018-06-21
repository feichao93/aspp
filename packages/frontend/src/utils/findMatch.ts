import { Map } from 'immutable'
import Decoration from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'

export default function findMatch(
  block: string,
  blockIndex: number,
  decorations: Map<string, Decoration>,
  text: string,
): DecorationRange[] {
  const result: DecorationRange[] = []
  if (text.length === 0) {
    return result
  }
  let i = 0
  while (true) {
    const nextIndex = block.indexOf(text, i)
    if (nextIndex === -1) {
      break
    }
    const range = new DecorationRange({
      blockIndex,
      startOffset: nextIndex,
      endOffset: nextIndex + text.length,
    })
    const overlapped = decorations.some(dec => DecorationRange.isOverlapped(dec.range, range))
    if (!overlapped) {
      result.push(range)
    }
    i = nextIndex + text.length
  }
  return result
}
