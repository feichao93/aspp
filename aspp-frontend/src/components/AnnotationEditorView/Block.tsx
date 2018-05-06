import { Button, ButtonGroup, Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import React from 'react'
import Decoration from '../../types/Decoration'
import layout from '../../utils/layout'
import Span from './Span'

interface BlockProps {
  block: string
  blockIndex: number
  decorationCount: number
  decorationSet: Set<Decoration>
  sel: Set<Decoration>
  selectBlockText(blockIndex: number): void
  clearBlockDecorations(blockIndex: number): void
  clickDecoration(decoration: Decoration, ctrlKey: boolean): void
}

export default class Block extends React.Component<BlockProps> {
  render() {
    const {
      block,
      blockIndex,
      decorationCount,
      decorationSet,
      sel,
      selectBlockText,
      clearBlockDecorations,
      clickDecoration,
    } = this.props

    const isSelected = (decoration: Decoration) => sel.includes(decoration)
    return (
      <div key={blockIndex} className="block" data-block data-blockindex={blockIndex}>
        <div className="block-meta">
          <p>block: {blockIndex}</p>
          <ButtonGroup className="block-button-group">
            <Button small onClick={() => selectBlockText(blockIndex)}>
              Select Text
            </Button>
            <Button small>Accept(?)</Button>
            <Button
              small
              intent={Intent.DANGER}
              onClick={() => clearBlockDecorations(blockIndex)}
              disabled={decorationCount === 0}
            >
              Clear({decorationCount})
            </Button>
          </ButtonGroup>
        </div>
        {layout(block, blockIndex, decorationSet).children.map((spanInfo, index) => (
          <Span
            key={index}
            info={spanInfo}
            onMouseDown={clickDecoration}
            isSelected={isSelected}
            block={block}
          />
        ))}
      </div>
    )
  }
}
