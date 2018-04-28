import React from 'react'
import { Annotation } from './interfaces'
import { getCurrentRange, getNextId } from './utils'

interface AnnotateButtonProps {
  label: string
  tag: string
  annotate(annotation: Annotation): void
}

export default class AnnotateButton extends React.Component<AnnotateButtonProps> {
  annotate = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault()
    const { annotate, tag } = this.props
    const annotationRange = getCurrentRange()
    if (annotationRange) {
      annotate({
        tag,
        range: annotationRange,
        confidence: 1,
        id: getNextId('annotation'),
      })
    }
  }

  render() {
    const { label } = this.props

    return <button onMouseDown={this.annotate}>{label}</button>
  }
}
