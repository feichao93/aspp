import React from 'react'
import calculateShouldComponentUpdate from '../../utils/calculateShouldComponentUpdate'
import { isSameSpanInfo, SpanInfo } from '../../utils/layout'
import calculateStyle from './calculateStyle'
import { TagAbbr } from './Span'

export interface LeafSpanProps {
  info: SpanInfo
  block: string
  selected: boolean
  visible: boolean
  processText(text: string): string
  onMouseDown(e: React.MouseEvent<HTMLElement>): void
}

export default class LeafSpan extends React.Component<LeafSpanProps> {
  shouldComponentUpdate(nextProps: LeafSpanProps) {
    return calculateShouldComponentUpdate(this.props, nextProps, { info: isSameSpanInfo })
  }

  render() {
    const { info, block, selected, visible, processText, onMouseDown } = this.props
    const { height, decoration } = info

    return (
      <span
        data-id={decoration.id}
        data-height={height}
        data-offset={decoration.range.startOffset}
        className={decoration.type}
        onMouseDown={onMouseDown}
        style={calculateStyle({ decoration, height, selected, visible })}
      >
        <TagAbbr decoration={decoration} />
        {processText(decoration.range.substring(block))}
      </span>
    )
  }
}
