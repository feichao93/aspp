import { Button, ButtonGroup } from '@blueprintjs/core'
import { is, Map, Set } from 'immutable'
import React from 'react'
import { Dispatch } from 'redux'
import Decoration from '../../types/Decoration'
import Action from '../../utils/actions'
import layout from '../../utils/layout'
import Span from './Span'

interface BlockProps {
  block: string
  blockIndex: number
  hintCount: number
  decorations: Set<Decoration>
  sel: Set<string>
  visibleMap: Map<string, boolean>
  dispatch: Dispatch
}

export default class Block extends React.Component<BlockProps> {
  shouldComponentUpdate(nextProps: BlockProps) {
    for (const key of Object.keys(this.props)) {
      if (!is((this.props as any)[key], (nextProps as any)[key])) {
        return true
      }
    }
    return false
  }

  onMouseDown = (decoration: Decoration, ctrlKey: boolean) => {
    this.props.dispatch(Action.userClickDecoration(decoration, ctrlKey))
  }

  render() {
    const { block, blockIndex, hintCount, decorations, sel, dispatch, visibleMap } = this.props

    return (
      <div key={blockIndex} className="block" data-block data-blockindex={blockIndex}>
        <div className="block-meta">
          <p>block: {blockIndex}</p>
          <ButtonGroup className="block-button-group">
            <Button small onClick={() => dispatch(Action.userSelectBlockHints(blockIndex))}>
              选中提示({hintCount})
            </Button>
            <Button small onClick={() => dispatch(Action.userSelectBlockText(blockIndex))}>
              选中文本
            </Button>
          </ButtonGroup>
        </div>
        {layout(block, blockIndex, decorations).children.map((spanInfo, index) => (
          <Span
            key={index}
            info={spanInfo}
            onMouseDown={this.onMouseDown}
            sel={sel}
            visibleMap={visibleMap}
            block={block}
          />
        ))}
      </div>
    )
  }
}
