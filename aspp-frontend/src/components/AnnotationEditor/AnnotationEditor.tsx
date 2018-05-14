import { is } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import Decoration from '../../types/Decoration'
import DecorationRange from '../../types/DecorationRange'
import MainState from '../../types/MainState'
import SelectionUtils from '../../utils/SelectionUtils'
import AnnotationButtonGroup from './AnnotationButtonGroup'
import './AnnotationEditor.styl'
import './annotations.styl'
import Block from './Block'
import EditHistoryButtonGroup from './EditHistoryButtonGroup'
import HintButtonGroup from './HintButtonGroup'

class AnnotationEditor extends React.Component<{ main: MainState; dispatch: Dispatch }> {
  getSnapshotBeforeUpdate() {
    return SelectionUtils.getCurrentRange()
  }

  componentDidUpdate(prevProps: any, prevState: any, snapshot: DecorationRange) {
    const currentRange = SelectionUtils.getCurrentRange()
    if (!is(currentRange, snapshot)) {
      SelectionUtils.setCurrentRange(snapshot)
    }
  }

  render() {
    const { dispatch, main } = this.props

    const decorations = main.gather()
    const decorationCountMap = decorations
      .groupBy(dec => dec.range.blockIndex)
      .map(decSet => decSet.count())
    const hintCountMap = decorations
      .groupBy(dec => dec.range.blockIndex)
      .map(decSet => decSet.count(Decoration.isHint))

    return (
      <div className="annotation-editor">
        <div style={{ display: 'flex', margin: '16px 8px', flex: '0 0 auto' }}>
          <AnnotationButtonGroup />
          <EditHistoryButtonGroup />
          <HintButtonGroup />
        </div>

        <div className="editor">
          {main.blocks.map((block, blockIndex) => (
            <Block
              key={blockIndex}
              block={block}
              blockIndex={blockIndex}
              decorationCount={decorationCountMap.get(blockIndex, 0)}
              hintCount={hintCountMap.get(blockIndex, 0)}
              decorations={decorations}
              sel={main.sel}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default connect(({ main }: State) => ({ main }))(AnnotationEditor)
