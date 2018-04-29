import AnnotatedDoc from './types/AnnotatedDoc'
import { Set } from 'immutable'
import Annotation from './types/Annotation'
import { getNextId } from './utils'
import AnnotationRange from './types/AnnotationRange'

function highlightMatch(doc: AnnotatedDoc, text: string) {
  const len = text.length
  const block = doc.plainDoc.blocks.first()
  const indexArray = []
  let i = 0
  while (true) {
    const nextIndex = block.indexOf(text, i)
    if (nextIndex === -1) {
      break
    }
    const occupied = doc.annotationSet.some(
      annotation =>
        annotation.range.blockIndex === 0 &&
        annotation.range.startOffset < nextIndex + len &&
        annotation.range.endOffset > nextIndex,
    )
    if (!occupied) {
      indexArray.push(nextIndex)
    }
    i = nextIndex + len
  }

  if (indexArray.length <= 1) {
    return doc
  }

  const highlightAnnotationSet: Set<Annotation> = Set(
    indexArray.map(
      i =>
        new Annotation({
          id: getNextId('annotation'),
          range: new AnnotationRange({ blockIndex: 0, startOffset: i, endOffset: i + len }),
          confidence: 1,
          tag: 'highlight',
        }),
    ),
  )

  return doc.update('annotationSet', set => set.union(highlightAnnotationSet))
}

export default { highlightMatch }
