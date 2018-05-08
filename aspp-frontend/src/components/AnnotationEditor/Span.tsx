import classNames from 'classnames'
import React from 'react'
import CONFIG from '../../taskConfig'
import Decoration from '../../types/Decoration'
import { SpanInfo } from '../../utils/layout'

interface SpanProps {
  info: SpanInfo
  onMouseDown?(decoration: Decoration, ctrlKey: boolean): void
  isSelected(decoration: Decoration): boolean
  block: string
  shortenLongText?: boolean
}

function TagAbbr({ decoration }: { decoration: Decoration }) {
  if (decoration.type === 'annotation') {
    const abbr = CONFIG.abbrMap.get(decoration.tag)
    if (abbr) {
      return (
        <span className="tag-abbr" data-skipoffset>
          {abbr}
        </span>
      )
    }
  }
  return null
}

export default class Span extends React.Component<SpanProps> {
  handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    const { onMouseDown, info } = this.props
    if (info.decoration.type !== 'text' && !Decoration.isPlainSlot(info.decoration)) {
      onMouseDown && onMouseDown(info.decoration, e.ctrlKey)
      e.stopPropagation()
    }
  }

  render(): any {
    const { info, block, onMouseDown, isSelected, shortenLongText } = this.props
    const { height, decoration, children } = info

    const selected = isSelected(decoration)
    const style =
      !selected && decoration.type === 'annotation'
        ? CONFIG.styleMap.get(decoration.tag)
        : undefined

    return (
      <span
        data-height={height}
        data-offset={decoration.range.startOffset}
        className={getClassName(decoration, selected)}
        onMouseDown={this.handleMouseDown}
        style={style}
      >
        <TagAbbr decoration={decoration} />
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
    return classNames('annotation', decoration.tag, { selected })
  } else {
    if (decoration.type === 'slot') {
      return classNames('slot', decoration.slotType, { selected })
    } else if (decoration.type === 'hint') {
      return classNames('hint', { selected })
    }
  }
}
