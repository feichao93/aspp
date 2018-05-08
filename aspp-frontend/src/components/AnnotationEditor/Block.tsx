import { Button, ButtonGroup, Intent } from '@blueprintjs/core'
import { Map, Set } from 'immutable'
import React from 'react'
import { Dispatch } from 'redux'
import Decoration from '../../types/Decoration'
import {
  acceptBlock,
  clearBlockDecorations,
  clickDecoration,
  selectBlockText,
} from '../../utils/actionCreators'
import layout from '../../utils/layout'
import Span from './Span'

interface BlockProps {
  block: string
  blockIndex: number
  decorationCount: number
  hintCount: number
  decorations: Map<string, Decoration>
  sel: Set<string>
  dispatch: Dispatch
}

export default class Block extends React.Component<BlockProps> {
  onMouseDown = (decoration: Decoration, ctrlKey: boolean) => {
    this.props.dispatch(clickDecoration(decoration, ctrlKey))
  }

  render() {
    const { block, blockIndex, decorationCount, hintCount, decorations, sel, dispatch } = this.props

    const isSelected = (decoration: Decoration) => sel.includes(decoration.id)

    return (
      <div key={blockIndex} className="block" data-block data-blockindex={blockIndex}>
        <div className="block-meta">
          <p>block: {blockIndex}</p>
          <ButtonGroup className="block-button-group">
            <Button small onClick={() => dispatch(selectBlockText(blockIndex))}>
              选择整块文本
            </Button>
            <Button
              small
              onClick={() => dispatch(acceptBlock(blockIndex))}
              disabled={hintCount === 0}
            >
              接受提示({hintCount})
            </Button>
            <Button
              small
              intent={Intent.DANGER}
              onClick={() => dispatch(clearBlockDecorations(blockIndex))}
              disabled={decorationCount === 0}
            >
              删除所有标注和提示({decorationCount})
            </Button>
          </ButtonGroup>
        </div>
        {layout(block, blockIndex, decorations.toSet()).children.map((spanInfo, index) => (
          <Span
            key={index}
            info={spanInfo}
            onMouseDown={this.onMouseDown}
            isSelected={isSelected}
            block={block}
          />
        ))}
      </div>
    )
  }
}
