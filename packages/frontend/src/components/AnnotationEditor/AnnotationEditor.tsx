import { is, Set } from 'immutable'
import React from 'react'
import { Dispatch } from 'redux'
import { ConfigState } from '../../reducers/configReducer'
import Decoration from '../../types/Decoration'
import MainState from '../../types/MainState'
import schedulers from '../../utils/schedulers'
import SelectionUtils from '../../utils/SelectionUtils'
import AnnotationButtonGroup from './AnnotationButtonGroup'
import './AnnotationEditor.styl'
import './annotations.styl'
import Block from './Block'
import EditHistoryButtonGroup from './EditHistoryButtonGroup'
import HintButtonGroup from './HintButtonGroup'

interface AnnotationEditorProps {
  main: MainState
  config: ConfigState
  dispatch: Dispatch
}

export default class AnnotationEditor extends React.Component<AnnotationEditorProps> {
  componentDidUpdate(prevProps: AnnotationEditorProps) {
    schedulers.raf(() => {
      const currentRange = SelectionUtils.getCurrentRange()
      const { main } = this.props
      // Synchronize native selection if necessary
      if (
        prevProps.main.docname === main.docname &&
        prevProps.main.collName === main.collName &&
        !is(currentRange, main.range)
      ) {
        SelectionUtils.setCurrentRange(main.range)
      }
    })
  }

  render() {
    const { dispatch, main, config } = this.props

    const decorations = main.gather()
    const decorationsByBlockIndex = decorations.groupBy(dec => dec.range.blockIndex)
    const selByBlockIndex = main.sel
      .map(id => decorations.get(id))
      .groupBy(dec => dec.range.blockIndex)
    const hintCountMap = decorationsByBlockIndex.map(decSet => decSet.count(Decoration.isHint))

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
              hintCount={hintCountMap.get(blockIndex, 0)}
              decorations={decorationsByBlockIndex.get(blockIndex, Set()).toSet()}
              sel={selByBlockIndex
                .get(blockIndex, Set())
                .toSet()
                .map(dec => dec.id)}
              visibleMap={config.visibleMap}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>
    )
  }
}
