import classNames from 'classnames'
import React from 'react'
import Decoration from '../../types/Decoration'

interface SpanProps {
  decoration: Decoration
  onClick?: (decoration: Decoration, ctrlKey: boolean) => void
  selected?: boolean
}

export default class Span extends React.Component<SpanProps> {
  render() {
    const { decoration, children, onClick, selected } = this.props
    const { range } = decoration
    if (Decoration.isText(decoration)) {
      return (
        <span
          className="text"
          data-offset={range.startOffset}
          onClick={e => onClick(decoration, e.ctrlKey)}
        >
          {children}
        </span>
      )
    } else if (Decoration.isAnnotation(decoration)) {
      const annotation = decoration.annotation
      return (
        <span
          className={classNames('annotation', annotation.tag, { selected })}
          data-annotationid={annotation ? annotation.id : undefined}
          data-offset={range.startOffset}
          onClick={e => onClick(decoration, e.ctrlKey)}
        >
          {children}
        </span>
      )
    } else if (Decoration.isHint(decoration)) {
      return (
        <span
          className={classNames('hint', { selected })}
          data-offset={range.startOffset}
          onClick={e => onClick(decoration, e.ctrlKey)}
        >
          {children}
        </span>
      )
    } else if (Decoration.isSlot(decoration)) {
      return (
        <span
          className={classNames('slot', decoration.slotType, { selected })}
          data-offset={range.startOffset}
          onClick={e => onClick(decoration, e.ctrlKey)}
        >
          {children}
        </span>
      )
    } else {
      throw new Error('invalid decoration')
    }
  }
}
