import React from 'react'
import { AnnotatedDoc, Annotation } from './interfaces'
import { Map } from 'immutable'

const defaultStyleMap: Map<string, React.CSSProperties> = Map({
  role: {
    background: '#5ea7ae',
    border: '1px solid #256bd2',
  },
  item: {
    background: '#8bc34a',
  },
})

interface SpanInfo {
  startOffset: number
  endOffset: number
  annotation: Annotation
}

function partition(block: string, annotations: Annotation[]) {
  const result: SpanInfo[] = []
  let i = 0
  let annotationIndex = 0
  while (i < block.length && annotationIndex < annotations.length) {
    const annotation = annotations[annotationIndex]
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

function genStyle(styleMap: Map<string, React.CSSProperties>, annotation: Annotation) {
  if (annotation == null) {
    return undefined
  } else {
    return styleMap.get(annotation.tag)
  }
}

interface AnnotationEditorProps {
  doc: AnnotatedDoc
  styleMap?: Map<string, React.CSSProperties>
}

export default class AnnotationEditor extends React.Component<AnnotationEditorProps> {
  render() {
    const {
      doc: {
        plainDoc: { blocks },
        author,
        annotationSet,
      },
      styleMap = defaultStyleMap,
    } = this.props

    return (
      <div className="editor">
        {blocks.map((block, blockIndex) => (
          <div key={blockIndex} data-block data-blockindex={blockIndex}>
            {partition(
              block,
              Array.from(annotationSet).filter(
                annotation => annotation.range.blockIndex === blockIndex,
              ),
            ).map(({ annotation, startOffset, endOffset }, index) => (
              <span
                key={index}
                style={genStyle(styleMap, annotation)}
                data-annotationid={annotation ? annotation.id : undefined}
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
