import React from 'react'
import { List } from 'immutable'
import { AnnotatedDoc, Annotation } from './types'

interface SpanInfo {
  startOffset: number
  endOffset: number
  annotation: Annotation
}

// TODO 需要考虑多个 tag 重叠的情况
function partition(block: string, annotations: List<Annotation>) {
  const result: SpanInfo[] = []
  let i = 0
  let annotationIndex = 0
  while (i < block.length && annotationIndex < annotations.size) {
    const annotation = annotations.get(annotationIndex)
    const range = annotation.range
    if (i < range.startOffset) {
      result.push({ startOffset: i, endOffset: range.startOffset, annotation: null })
      i = range.startOffset
    } else {
      result.push({
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        annotation,
      })
      i = range.endOffset
      annotationIndex++
    }
  }
  if (i < block.length) {
    result.push({
      annotation: null,
      startOffset: i,
      endOffset: block.length,
    })
  }
  return result
}

function genClassName(annotation: Annotation) {
  if (annotation == null) {
    return
  } else {
    return ['annotation', annotation.tag].join(' ')
  }
}

interface AnnotationEditorProps {
  doc: AnnotatedDoc
}

export default class AnnotationEditor extends React.Component<AnnotationEditorProps> {
  render() {
    const {
      doc: {
        plainDoc: { blocks },
        author,
        annotationSet,
      },
    } = this.props

    return (
      <div className="editor">
        {blocks.map((block, blockIndex) => (
          <div key={blockIndex} data-block data-blockindex={blockIndex}>
            {partition(
              block,
              annotationSet
                .filter(annotation => annotation.range.blockIndex === blockIndex)
                .sortBy(annotation => annotation.range.startOffset)
                .toList(),
            ).map(({ annotation, startOffset, endOffset }, index) => (
              <span
                key={index}
                className={genClassName(annotation)}
                data-annotationid={annotation ? annotation.id : undefined}
                data-offset={startOffset}
              >
                {block.substring(startOffset, endOffset)}
              </span>
            ))}
          </div>
        ))}
      </div>
    )
  }
}
