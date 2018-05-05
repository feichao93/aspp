import classNames from 'classnames'
import React from 'react'
import Decoration from '../../types/Decoration'
import { SpanInfo } from '../../utils/layout'

interface SpanProps {
  info: SpanInfo
  onMouseDown?(decoration: Decoration, ctrlKey: boolean): void
  isSelected(decoration: Decoration): boolean
  block: string
  shortenLongText?: boolean
}

export default class Span extends React.Component<SpanProps> {
  onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    const {
      onMouseDown,
      info: { decoration },
    } = this.props
    onMouseDown(decoration, e.ctrlKey)
    if (decoration.type !== 'text') {
      e.stopPropagation()
    }
  }

  render(): any {
    const { info, block, onMouseDown, isSelected, shortenLongText } = this.props
    const { height, decoration, children } = info

    return (
      <span
        data-height={height}
        data-offset={decoration.range.startOffset}
        className={getClassName(decoration, isSelected(decoration))}
        onMouseDown={this.onMouseDown}
      >
        {height > 0
          ? children.map((child, index) => (
              <Span
                key={index}
                info={child}
                onMouseDown={onMouseDown}
                isSelected={isSelected}
                block={block}
                shortenLongText={shortenLongText}
              />
            ))
          : decoration.range.substring(block, shortenLongText)}
      </span>
    )
  }
}

function getClassName(decoration: Decoration, selected: boolean) {
  if (decoration.type === 'text') {
    return classNames('text', { selected })
  } else if (decoration.type === 'annotation') {
    return classNames('annotation', decoration.annotation.tag, { selected })
  } else {
    if (decoration.type === 'slot') {
      return classNames('slot', decoration.slotType, { selected })
    } else if (decoration.type === 'hint') {
      return classNames('hint', { selected })
    }
  }
}
