import React from 'react'
import { Decoration } from '../../types/DecorationSet'

interface SpanProps {
  decoration: Decoration
  block: string
  onClick: (event: React.MouseEvent<HTMLSpanElement>, decoration: Decoration) => void
}

export default class Span extends React.Component<SpanProps> {
  render() {
    const { decoration, children, onClick } = this.props
    const { range } = decoration
    if (decoration.type === 'text') {
      return (
        <span className="text" data-offset={range.startOffset}>
          {children}
        </span>
      )
    } else if (decoration.type === 'annotation') {
      const annotation = decoration.annotation
      return (
        <span
          className={['annotation', annotation.tag].join(' ')}
          data-annotationid={annotation ? annotation.id : undefined}
          data-offset={range.startOffset}
        >
          {children}
        </span>
      )
    } else if (decoration.type === 'hint') {
      return (
        <span className="hint" data-offset={range.startOffset}>
          {children}
        </span>
      )
    } else if (decoration.type === 'slot') {
      return (
        <span
          className={['slot', decoration.slotType].join(' ')}
          data-offset={range.startOffset}
          onClick={e => onClick(e, decoration)}
        >
          {children}
        </span>
      )
    } else {
      throw new Error('invalid decoration')
    }
  }
}
