import React from 'react'
import { Annotation } from './types'
import { getNextId, preventDefault } from './utils'
import { getCurrentRange } from './SelectionUtils'

interface AnnotateButtonProps {
  label: string
  tag: string
  annotate(annotation: Annotation): void
}

export default class AnnotateButton extends React.Component<AnnotateButtonProps> {
  annotate = () => {
    const { annotate, tag } = this.props
    const annotationRange = getCurrentRange()
    if (annotationRange) {
      annotate(
        new Annotation({
          tag,
          range: annotationRange,
          confidence: 1,
          id: getNextId('annotation'),
        }),
      )
    } else {
      // TODO make a toast showing 'invalid selection'
      console.log('invalid selection')
    }
  }

  render() {
    const { label } = this.props

    return (
      <button onMouseDown={preventDefault} onClick={this.annotate}>
        {label}
      </button>
    )
  }
}
