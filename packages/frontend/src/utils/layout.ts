import { is, Set } from 'immutable'
import Decoration, { Slot, Text } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import { compareDecorationPosArray, range } from './common'

export interface SpanInfo {
  // span的「高度」，-1 表示高度未知，0 表示该 span 没有子节点
  // 大于 0 表示 span 至少存在一个高度为 height-1 的子节点
  height: number
  decoration: Decoration
  children: SpanInfo[]
}

export function isSameSpanInfo(a: SpanInfo, b: SpanInfo): boolean {
  return (
    a.height === b.height &&
    is(a.decoration, b.decoration) &&
    a.children.length === b.children.length &&
    range(0, a.children.length).every(i => isSameSpanInfo(a.children[i], b.children[i]))
  )
}

export default function layout(
  block: string,
  blockIndex: number,
  decorations: Set<Decoration>,
): SpanInfo {
  const list = decorations.sort(compareDecorationPosArray)

  const blockRange = new DecorationRange({ blockIndex, startOffset: 0, endOffset: block.length })
  const stack: SpanInfo[] = [
    {
      height: -1,
      decoration: new Slot({ range: blockRange, slotType: 'block-slot' }),
      children: [],
    },
  ]

  if (list.isEmpty()) {
    append(makeText(0, block.length))
  } else {
    for (const decoration of list) {
      append({ height: -1, decoration, children: [] })
    }
  }

  return flush()

  // region function-definition
  function append(spanInfo: SpanInfo) {
    const range = spanInfo.decoration.range
    while (true) {
      const last = stack[stack.length - 1]
      const lastEnd = last.decoration.range.endOffset
      if (lastEnd >= range.endOffset) {
        if (spanInfo.height !== 0) {
          stack.push(spanInfo)
          const prevSibling = lastChild(last)
          const prevSiblingEnd = prevSibling
            ? prevSibling.decoration.range.endOffset
            : last.decoration.range.startOffset
          if (prevSiblingEnd < range.startOffset) {
            last.children.push(makeText(prevSiblingEnd, range.startOffset))
          }
        }
        last.children.push(spanInfo)
        break
      } else if (lastEnd <= range.startOffset) {
        stack.pop()
        if (lastEnd < range.startOffset) {
          const parentEnd = stack[stack.length - 1].decoration.range.endOffset
          if (lastEnd < Math.min(parentEnd, range.startOffset)) {
            append(makeText(lastEnd, Math.min(parentEnd, range.startOffset)))
          }
        }
        assignHeight(last)
      } else {
        throw new Error('Decoration Overlapping!')
      }
    }
  }

  function flush(): SpanInfo {
    // 不断 pop，直到 stack 中只剩下 block-slot
    while (stack.length > 1) {
      const last = stack[stack.length - 1]
      const parent = stack[stack.length - 2]
      if (parent !== null) {
        const lastEnd = last.decoration.range.endOffset
        const parentEnd = parent.decoration.range.endOffset
        if (lastEnd < parentEnd) {
          parent.children.push(makeText(lastEnd, parentEnd))
        }
      }
      assignHeight(last)
      stack.pop()
    }
    assignHeight(stack[0])
    return stack[0]
  }

  function makeText(startOffset: number, endOffset: number): SpanInfo {
    return {
      height: 0,
      decoration: new Text({
        type: 'text',
        range: new DecorationRange({ blockIndex, startOffset, endOffset }),
      }),
      children: [],
    }
  }

  function assignHeight(spanInfo: SpanInfo) {
    if (spanInfo.children == null || spanInfo.children.length === 0) {
      spanInfo.height = 0
    } else {
      const childHeights = spanInfo.children.map(child => child.height)
      spanInfo.height = Math.max(...childHeights) + 1
    }
  }

  function lastChild(spanInfo: SpanInfo) {
    if (spanInfo.children && spanInfo.children.length > 0) {
      return spanInfo.children[spanInfo.children.length - 1]
    } else {
      return null
    }
  }
  // endregion
}
