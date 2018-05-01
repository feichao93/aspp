import { Record, Set } from 'immutable'
import { Annotation } from './index'
import AnnotatedDoc from './AnnotatedDoc'

interface AnnotationDecoration {
  type: 'annotation'
  blockIndex: number
  startOffset: number
  endOffset: number
  annotation: Annotation
}

interface Text {
  type: 'text'
  blockIndex: number
  startOffset: number
  endOffset: number
  text: string
}

interface Hint {
  type: 'hint'
  blockIndex: number
  startOffset: number
  endOffset: number
  hint: string
}

interface Slot {
  type: 'slot'
  slotType: string
  blockIndex: number
  startOffset: number
  endOffset: number
}

// TODO add Diagnostics
export type Decoration = Text | AnnotationDecoration | Hint | Slot

const DecorationSetRecord = Record({
  decSet: Set<Decoration>(),
})

export default class DecorationSet extends DecorationSetRecord {
  static fromDoc(doc: AnnotatedDoc) {
    return new DecorationSet({
      decSet: doc.annotationSet.map(
        annotation =>
          ({
            type: 'annotation',
            annotation,
            blockIndex: annotation.range.blockIndex,
            startOffset: annotation.range.startOffset,
            endOffset: annotation.range.endOffset,
          } as AnnotationDecoration),
      ),
    })
  }

  addSelection(selection: Set<Decoration>) {
    return this.update('decSet', decSet => decSet.union(selection))
  }

  highlightMatch(block: string, blockIndex: number, text: string) {
    if (text.length === 0) {
      return this
    }
    const indexArray: number[] = []
    let i = 0
    while (true) {
      const nextIndex = block.indexOf(text, i)
      if (nextIndex === -1) {
        break
      }
      const occupied = this.decSet.some(
        dec =>
          dec.blockIndex === blockIndex &&
          dec.startOffset < nextIndex + text.length &&
          dec.endOffset > nextIndex,
      )
      if (!occupied) {
        indexArray.push(nextIndex)
      }
      i = nextIndex + text.length
    }

    return this.update('decSet', decSet =>
      decSet.union(
        indexArray.map(
          i =>
            ({
              type: 'slot',
              slotType: 'highlight',
              startOffset: i,
              endOffset: i + text.length,
              blockIndex,
            } as Slot),
        ),
      ),
    )
  }

  completeTexts(block: string, blockIndex: number) {
    const list = this.decSet
      .filter(dec => dec.blockIndex === blockIndex)
      .sortBy(dec => dec.startOffset)
      .toList()

    const result: Decoration[] = []

    let i = 0
    let decorationIndex = 0
    while (i < block.length && decorationIndex < list.size) {
      const decoration = list.get(decorationIndex)
      if (i < decoration.startOffset) {
        const endOffset = decoration.startOffset
        result.push({
          type: 'text',
          blockIndex,
          startOffset: i,
          endOffset,
          text: block.substring(i, endOffset),
        })
        i = endOffset
      } else if (i === decoration.startOffset) {
        result.push(decoration)
        i = decoration.endOffset
        decorationIndex++
      } else {
        // TODO handle composite decorations
        decorationIndex++
      }
    }

    if (i < block.length) {
      result.push({
        type: 'text',
        blockIndex,
        startOffset: i,
        endOffset: block.length,
        text: block.substring(i),
      })
    }

    return result
  }
}
