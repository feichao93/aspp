import { Set } from 'immutable'
import React from 'react'
import { Dispatch } from 'redux'
import { ConfigState } from '../../reducers/configReducer'
import Decoration from '../../types/Decoration'
import MainState from '../../types/MainState'
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
  // TODO 这段代码目前看不懂了，好像已经没有什么用了
  // getSnapshotBeforeUpdate() {
  //   return SelectionUtils.getCurrentRange()
  // }
  //
  // componentDidUpdate(prevProps: AnnotationEditorProps, prevState: any, snapshot: DecorationRange) {
  //   const currentRange = SelectionUtils.getCurrentRange()
  //   const { main } = this.props
  //   if (
  //     prevProps.main.docname === main.docname &&
  //     prevProps.main.collName === main.collName &&
  //     !is(currentRange, snapshot)
  //   ) {
  //     SelectionUtils.setCurrentRange(snapshot)
  //   }
  // }

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
