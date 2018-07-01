import { Button, ButtonGroup } from '@blueprintjs/core'
import { is, Set } from 'immutable'
import React from 'react'
import { Dispatch } from 'redux'
import { Config } from '../../reducers/configReducer'
import Decoration from '../../types/Decoration'
import Action from '../../utils/actions'
import calculateShouldComponentUpdate from '../../utils/calculateShouldComponentUpdate'
import layout from '../../utils/layout'
import Span, { isVisibleFactory } from './Span'

interface BlockProps {
  block: string
  blockIndex: number
  hintCount: number
  decorations: Set<Decoration>
  sel: Set<string>
  config: Config
  dispatch: Dispatch
}

export default class Block extends React.Component<BlockProps> {
  shouldComponentUpdate(nextProps: BlockProps) {
    return calculateShouldComponentUpdate(this.props, nextProps, {
      decorations: is,
      sel: is,
      config: is,
    })
  }

  handleClickDecoration = (decoration: Decoration, ctrlKey: boolean) => {
    this.props.dispatch(Action.userClickDecoration(decoration, ctrlKey))
  }

  render() {
    const { block, blockIndex, hintCount, decorations, sel, config, dispatch } = this.props

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
            handleClickDecoration={this.handleClickDecoration}
            isSelected={d => sel.has(d.id)}
            isVisible={isVisibleFactory(config)}
            block={block}
          />
        ))}
      </div>
    )
  }
}
