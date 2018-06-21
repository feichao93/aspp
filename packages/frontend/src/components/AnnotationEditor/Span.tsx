import classNames from 'classnames'
import { is, Map, Set } from 'immutable'
import React from 'react'
import ASPP_CONFIG from '../../aspp-config'
import Decoration from '../../types/Decoration'
import { isSameSpanInfo, SpanInfo } from '../../utils/layout'

interface SpanProps {
  info: SpanInfo
  block: string
  shortenLongText?: boolean
  sel: Set<string>
  // TODO 去掉 visibleMap 对应的问号
  visibleMap?: Map<string, boolean>
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
  shouldComponentUpdate(nextProps: SpanProps) {
    const { info, block, shortenLongText, visibleMap, onMouseDown, sel } = this.props
    return (
      !isSameSpanInfo(info, nextProps.info) ||
      block !== nextProps.block ||
      shortenLongText !== nextProps.shortenLongText ||
      !is(visibleMap, nextProps.visibleMap) ||
      !is(sel, nextProps.sel) ||
      onMouseDown !== nextProps.onMouseDown
    )
  }

  handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    const { onMouseDown, info } = this.props
    if (info.decoration.type !== 'text' && !Decoration.isPlainSlot(info.decoration)) {
      if (onMouseDown) {
        onMouseDown(info.decoration, e.ctrlKey)
      }
      // 阻止 selection-change 事件，防止 sel 被清空
      e.stopPropagation()
    }
  }

  render(): any {
    const { info, block, onMouseDown, sel, visibleMap, shortenLongText } = this.props
    const { height, decoration, children } = info

    const selected = sel.includes(decoration.id)
    const visible =
      visibleMap == null || !Decoration.isAnnotation(decoration) || visibleMap.get(decoration.tag)
    const style =
      !selected && visible && decoration.type === 'annotation'
        ? ASPP_CONFIG.styleMap.get(decoration.tag)
        : undefined

    return (
      <span
        data-id={decoration.id ? decoration.id : undefined}
        data-height={height}
        data-offset={decoration.range.startOffset}
        className={getClassName(decoration, selected)}
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
                sel={sel}
                visibleMap={visibleMap}
                onMouseDown={onMouseDown}
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
