import classNames from 'classnames'
import React from 'react'
import Decoration from '../../types/Decoration'
import { SpanInfo } from '../../utils/digest'

interface SpanProps {
  info: SpanInfo
  onMouseDown?(decoration: Decoration, ctrlKey: boolean): void
  isSelected(decoration: Decoration): boolean
  block: string
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
    const {
      info: { type: infoType, decoration, children },
      block,
      onMouseDown,
      isSelected,
    } = this.props
    const range = decoration.range

    return (
      <span
        data-composition={infoType === 'composition' ? '' : undefined}
        data-offset={range.startOffset}
        className={getClassName(decoration)}
        onMouseDown={this.onMouseDown}
      >
        {infoType === 'atom'
          ? block.substring(range.startOffset, range.endOffset)
          : children.map((child, index) => (
              <Span
                key={index}
                info={child}
                onMouseDown={onMouseDown}
                isSelected={isSelected}
                block={block}
              />
            ))}
      </span>
    )

    // region function-definition
    function getClassName(decoration: Decoration) {
      const selected = isSelected(decoration)
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
    // endregion
  }
}
