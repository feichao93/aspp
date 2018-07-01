import React from 'react'
import ASPP_CONFIG from '../../aspp-config'
import { Config } from '../../reducers/configReducer'
import Decoration from '../../types/Decoration'
import { always, identity } from '../../utils/common'
import { SpanInfo } from '../../utils/layout'
import LeafSpan from './LeafSpan'
import NonLeafSpan from './NonLeafSpan'

export const isVisibleFactory = (config: Config) => (d: Decoration) =>
  d.type !== 'annotation' || config.visibleMap.get(d.tag)

export const TagAbbr = ({ decoration }: { decoration: Decoration }) => {
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

interface SpanProps {
  info: SpanInfo
  block: string
  isSelected?: (d: Decoration) => boolean
  isVisible?: (d: Decoration) => boolean
  handleClickDecoration?(decoration: Decoration, ctrlKey: boolean): void
  processText?(s: string): string
}

export default class Span extends React.Component<SpanProps> {
  static defaultProps = {
    isSelected: always(false),
    isVisible: always(true),
    processText: identity,
  }

  onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    const { handleClickDecoration, info } = this.props
    if (!Decoration.isText(info.decoration) && !Decoration.isPlainSlot(info.decoration)) {
      if (handleClickDecoration) {
        handleClickDecoration(info.decoration, e.ctrlKey)
      }
      // 阻止 mouse-down 事件的传播，防止选中 parent-decoration
      e.stopPropagation()
    }
  }

  render(): any {
    const { info, block, isSelected, isVisible, handleClickDecoration, processText } = this.props

    if (info.height === 0) {
      return (
        <LeafSpan
          info={info}
          block={block}
          selected={isSelected(info.decoration)}
          visible={isVisible(info.decoration)}
          onMouseDown={this.onMouseDown}
          processText={processText}
        />
      )
    } else {
      return (
        <NonLeafSpan
          info={info}
          block={block}
          isSelected={isSelected}
          isVisible={isVisible}
          processText={processText}
          onMouseDown={this.onMouseDown}
          handleClickDecoration={handleClickDecoration}
        />
      )
    }
  }
}
