import React from 'react'
import Decoration from '../../types/Decoration'
import { SpanInfo } from '../../utils/layout'
import calculateStyle from './calculateStyle'
import Span, { TagAbbr } from './Span'

export interface NonLeafSpanProps {
  info: SpanInfo
  block: string
  isSelected: (d: Decoration) => boolean
  isVisible: (d: Decoration) => boolean
  processText(text: string): string
  handleClickDecoration(decoration: Decoration, ctrlKey: boolean): void
  onMouseDown(e: React.MouseEvent<HTMLElement>): void
}

export default class NonLeafSpan extends React.Component<NonLeafSpanProps> {
  render() {
    const {
      info,
      block,
      onMouseDown,
      handleClickDecoration,
      isSelected,
      isVisible,
      processText,
    } = this.props
    const { height, decoration, children } = info

    const selected = isSelected(decoration)
    const visible = isVisible(decoration)

    const style = calculateStyle({ decoration, height, selected, visible })

    return (
      <span
        data-id={decoration.id}
        data-height={height}
        data-offset={decoration.range.startOffset}
        className={decoration.type}
        onMouseDown={onMouseDown}
        style={style}
      >
        <TagAbbr decoration={decoration} />
        {children.map((child, index) => (
          <Span
            key={index}
            info={child}
            block={block}
            processText={processText}
            isSelected={isSelected}
            isVisible={isVisible}
            handleClickDecoration={handleClickDecoration}
          />
        ))}
      </span>
    )
  }
}
