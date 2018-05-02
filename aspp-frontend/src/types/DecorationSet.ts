import { Record, Set } from 'immutable'
import AnnotatedDoc from './AnnotatedDoc'
import DecorationRange from './DecorationRange'
import Annotation from './Annotation'

interface AnnotationDecoration {
  readonly type: 'annotation'
  readonly range: DecorationRange
  readonly annotation: Annotation
}

interface Text {
  readonly type: 'text'
  readonly range: DecorationRange
}

interface Hint {
  readonly type: 'hint'
  readonly range: DecorationRange
  readonly hint: string
}

interface Slot {
  readonly type: 'slot'
  readonly slotType: string
  readonly range: DecorationRange
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
          ({ type: 'annotation', annotation, range: annotation.range } as AnnotationDecoration),
      ),
    })
  }

  addSel(selection: Set<Decoration>) {
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
        ({ range }) =>
          range.blockIndex === blockIndex &&
          range.startOffset < nextIndex + text.length &&
          range.endOffset > nextIndex,
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
              range: new DecorationRange({
                blockIndex,
                startOffset: i,
                endOffset: i + text.length,
              }),
            } as Slot),
        ),
      ),
    )
  }

  completeTexts(block: string, blockIndex: number) {
    const list = this.decSet
      .filter(dec => dec.range.blockIndex === blockIndex)
      .sortBy(dec => dec.range.startOffset)
      .toList()

    const result: Decoration[] = []

    let i = 0
    let decorationIndex = 0
    while (i < block.length && decorationIndex < list.size) {
      const decoration = list.get(decorationIndex)
      if (i < decoration.range.startOffset) {
        const endOffset = decoration.range.startOffset
        result.push({
          type: 'text',
          range: new DecorationRange({
            blockIndex,
            startOffset: i,
            endOffset,
          }),
        })
        i = endOffset
      } else if (i === decoration.range.startOffset) {
        result.push(decoration)
        i = decoration.range.endOffset
        decorationIndex++
      } else {
        // TODO handle composite decorations
        decorationIndex++
      }
    }

    if (i < block.length) {
      result.push({
        type: 'text',
        range: new DecorationRange({
          blockIndex,
          startOffset: i,
          endOffset: block.length,
        }),
      })
    }

    return result
  }
}
