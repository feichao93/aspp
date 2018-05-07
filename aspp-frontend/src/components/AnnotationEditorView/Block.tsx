import { Button, ButtonGroup, Intent } from '@blueprintjs/core'
import { Map, Set } from 'immutable'
import React from 'react'
import { Dispatch } from 'redux'
import Decoration from '../../types/Decoration'
import { clearBlockDecorations, clickDecoration, selectBlockText } from '../../utils/actionCreators'
import layout from '../../utils/layout'
import Span from './Span'

interface BlockProps {
  block: string
  blockIndex: number
  decorationCount: number
  decorations: Map<string, Decoration>
  sel: Set<string>
  dispatch: Dispatch
}

export default class Block extends React.Component<BlockProps> {
  render() {
    const { block, blockIndex, decorationCount, decorations, sel, dispatch } = this.props

    const isSelected = (decoration: Decoration) => sel.includes(decoration.id)

    return (
      <div key={blockIndex} className="block" data-block data-blockindex={blockIndex}>
        <div className="block-meta">
          <p>block: {blockIndex}</p>
          <ButtonGroup className="block-button-group">
            <Button small onClick={() => dispatch(selectBlockText(blockIndex))}>
              Select Text
            </Button>
            <Button small>Accept(?)</Button>
            <Button
              small
              intent={Intent.DANGER}
              onClick={() => dispatch(clearBlockDecorations(blockIndex))}
              disabled={decorationCount === 0}
            >
              Clear({decorationCount})
            </Button>
          </ButtonGroup>
        </div>
        {layout(block, blockIndex, decorations.toSet()).children.map((spanInfo, index) => (
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
