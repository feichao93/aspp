import { is, Set } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { State } from '../../reducer'
import Decoration from '../../types/Decoration'
import DecorationRange from '../../types/DecorationRange'
import {
  clearBlockDecorations,
  clickDecoration,
  selectBlockText,
  selectMatch,
  setSel,
} from '../../utils/actionCreators'
import { identity } from '../../utils/common'
import SelectionUtils from '../../utils/SelectionUtils'
import AnnotationButtonGroup from './AnnotationButtonGroup'
import './AnnotationEditorView.styl'
import './annotations.styl'
import Block from './Block'

export interface AnnotationEditorViewProps {
  setSel(decorationSet: Set<Decoration>): void
  selectBlockText(blockIndex: number): void
  clearBlockDecorations(blockIndex: number): void
  clickDecoration(decoration: Decoration, ctrlKey: boolean): void
  selectMatch(pattern: string | RegExp): void
}

class AnnotationEditorView extends React.Component<State & AnnotationEditorViewProps> {
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
    const { doc, sel, clearBlockDecorations, selectBlockText, clickDecoration } = this.props

    const decorationSet = doc.annotationSet.map(Decoration.fromAnnotation).toOrderedSet()
    const countMap = decorationSet
      .groupBy(decoration => decoration.range.blockIndex)
      .map(decSet => decSet.count())

    return (
      <div className="annotation-editor-view">
        <AnnotationButtonGroup style={{ margin: '16px 8px', flex: '0 0 auto' }} />
        <div className="editor">
          {doc.plainDoc.blocks.map((block, blockIndex) => (
            <Block
              key={blockIndex}
              block={block}
              blockIndex={blockIndex}
              decorationCount={countMap.get(blockIndex, 0)}
              decorationSet={decorationSet}
              sel={sel}
              clearBlockDecorations={clearBlockDecorations}
              clickDecoration={clickDecoration}
              selectBlockText={selectBlockText}
            />
          ))}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  setSel,
  selectBlockText,
  clearBlockDecorations,
  clickDecoration,
  selectMatch,
}

type Keyed<T> = { [key in keyof T]: any }
const enhancer = connect<State, Keyed<typeof mapDispatchToProps>>(identity, mapDispatchToProps)
export default enhancer(AnnotationEditorView)
