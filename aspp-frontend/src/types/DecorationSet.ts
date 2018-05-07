import { Record, Set } from 'immutable'
import AnnotatedDoc from './AnnotatedDoc'
import Decoration, { Slot } from './Decoration'
import DecorationRange from './DecorationRange'

const DecorationSetRecord = Record({
  decSet: Set<Decoration>(),
})

export default class DecorationSet extends DecorationSetRecord {
  // static fromDoc(doc: AnnotatedDoc) {
  //   return new DecorationSet({ decSet: doc.annotationSet.map(Decoration.fromAnnotation) })
  // }

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
        indexArray.map(index => {
          const range = new DecorationRange({
            blockIndex,
            startOffset: index,
            endOffset: index + text.length,
          })
          return new Slot({ type: 'slot', slotType: 'highlight', range })
        }),
      ),
    )
  }
}
