import { is } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import DecorationRange from '../../types/DecorationRange'
import MainState  from '../../types/MainState'
import SelectionUtils from '../../utils/SelectionUtils'
import AnnotationButtonGroup from './AnnotationButtonGroup'
import './AnnotationEditor.styl'
import './annotations.styl'
import Block from './Block'

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
    const countMap = decorations.groupBy(dec => dec.range.blockIndex).map(decSet => decSet.count())

    return (
      <div className="annotation-editor">
        <AnnotationButtonGroup style={{ margin: '16px 8px', flex: '0 0 auto' }} />
        <div className="editor">
          {main.doc.blocks.map((block, blockIndex) => (
            <Block
              key={blockIndex}
              block={block}
              blockIndex={blockIndex}
              decorationCount={countMap.get(blockIndex, 0)}
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
