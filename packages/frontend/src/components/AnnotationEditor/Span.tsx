import React from 'react'
import ASPP_CONFIG from '../../aspp-config'
import { Config } from '../../reducers/configReducer'
import Decoration from '../../types/Decoration'
import { always } from '../../utils/common'
import { SpanInfo } from '../../utils/layout'
import calculateStyle from './calculateStyle'

export const isVisibleFactory = (config: Config) => (d: Decoration) =>
  d.type !== 'annotation' || config.visibleMap.get(d.tag)

interface SpanProps {
  info: SpanInfo
  block: string
  shortenLongText?: boolean
  isSelected?: (d: Decoration) => boolean
  isVisible?: (d: Decoration) => boolean
  onMouseDown?(decoration: Decoration, ctrlKey: boolean): void
}

function TagAbbr({ decoration }: { decoration: Decoration }) {
  if (decoration.type === 'annotation') {
    const abbr = ASPP_CONFIG.abbrMap.get(decoration.tag)
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
  static defaultProps = {
    isSelected: always(false),
    isVisible: always(true),
  }

  handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    const { onMouseDown, info } = this.props
    if (!Decoration.isText(info.decoration) && !Decoration.isPlainSlot(info.decoration)) {
      if (onMouseDown) {
        onMouseDown(info.decoration, e.ctrlKey)
      }
      // 阻止 mouse-down 事件的传播，防止选中 parent-decoration
      e.stopPropagation()
    }
  }

  render(): any {
    const { info, block, onMouseDown, isSelected, isVisible, shortenLongText } = this.props
    const { height, decoration, children } = info

    const style = calculateStyle({
      decoration,
      height,
      selected: isSelected(decoration),
      visible: isVisible(decoration),
    })

    return (
      <span
        data-id={decoration.id ? decoration.id : undefined}
        data-height={height}
        data-offset={decoration.range.startOffset}
        className={decoration.type}
        onMouseDown={this.handleMouseDown}
        style={style}
        title={decoration.type === 'hint' ? decoration.hint : undefined}
      >
        <TagAbbr decoration={decoration} />
        {height > 0
          ? children.map((child, index) => (
              <Span
                key={index}
                info={child}
                block={block}
                shortenLongText={shortenLongText}
                isSelected={isSelected}
                isVisible={isVisible}
                onMouseDown={onMouseDown}
              />
            ))
          : decoration.range.substring(block, shortenLongText)}
      </span>
    )
  }
}
