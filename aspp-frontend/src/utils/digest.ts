import { Set } from 'immutable'
import Annotation from '../types/Annotation'
import Decoration, { AnnotationDecoration, Slot, Text } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import { compareArray, getNextId } from './common'

export type SpanInfo =
  | { type: 'composition'; decoration: AnnotationDecoration; children: SpanInfo[] }
  | { type: 'atom'; decoration: Decoration; children?: SpanInfo[] }

export function covertSpanInfoArraytoString(block: string, spanInfoArray: SpanInfo[]) {
  function dfs(spanInfo: SpanInfo): string {
    if (spanInfo.type === 'composition') {
      return `${spanInfo.decoration.annotation.tag}[ ${spanInfo.children.map(dfs).join(', ')} ]`
    } else {
      const decoration = spanInfo.decoration
      if (decoration.type === 'text') {
        return JSON.stringify(
          block.substring(decoration.range.startOffset, decoration.range.endOffset),
        )
      } else if (decoration.type === 'annotation') {
        return JSON.stringify(
          `${decoration.annotation.tag}:${block.substring(
            decoration.range.startOffset,
            decoration.range.endOffset,
          )}`,
        )
      } else {
        return String(spanInfo.decoration)
      }
    }
  }

  return spanInfoArray.map(dfs).join(', ')
}

export default function digest(
  block: string,
  blockIndex: number,
  decorationSet: Set<Decoration>,
): SpanInfo[] {
  const array = decorationSet
    .filter(decoration => decoration.range.blockIndex === blockIndex)
    .sortBy(({ range }) => [range.startOffset, -range.endOffset], compareArray)
    .toArray()

  if (array.length === 0) {
    return [
      {
        type: 'atom',
        decoration: new Text({
          type: 'text',
          range: new DecorationRange({ blockIndex, startOffset: 0, endOffset: block.length }),
        }),
      },
    ]
  }

  const stack: SpanInfo[] = [
    {
      type: 'composition',
      decoration: Decoration.fromAnnotation(
        new Annotation({
          id: getNextId('dummy-annotation'),
          range: new DecorationRange({
            blockIndex,
            startOffset: 0,
            endOffset: block.length,
          }),
          tag: 'block',
        }),
      ),
      children: [],
    },
  ]

  for (const decoration of array) {
    append({
      type: 'composition',
      decoration: decoration as AnnotationDecoration,
      children: [],
    })
  }

  return flush()

  // region function-definition
  function append(spanInfo: SpanInfo) {
    const range = spanInfo.decoration.range
    while (true) {
      const last = stack[stack.length - 1]
      const lastEnd = last.decoration.range.endOffset
      if (lastEnd >= range.endOffset) {
        if (spanInfo.type !== 'atom') {
          stack.push(spanInfo)
          const prevSibling =
            last.children.length === 0 ? null : last.children[last.children.length - 1]
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
        if (last.children.length === 0) {
          last.type = 'atom'
          delete last.children
        }
      } else {
        throw new Error('Decoration Overlapping!')
      }
    }
  }

  function flush() {
    // 不断 pop，直到 stack 中只剩下 block 对应的 dummy-annotation
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
      if (last.children.length === 0) {
        last.type = 'atom'
        delete last.children
      }
      stack.pop()
    }
    return stack[0].children
  }

  function makeText(startOffset: number, endOffset: number): SpanInfo {
    return {
      type: 'atom',
      decoration: new Text({
        type: 'text',
        range: new DecorationRange({ blockIndex, startOffset, endOffset }),
      }),
    }
  }
  // endregion
}
