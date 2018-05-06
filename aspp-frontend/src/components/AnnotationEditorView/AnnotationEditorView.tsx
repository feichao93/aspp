import { Button, ButtonGroup, Intent, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { is, Set } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { State } from '../../reducer'
import Decoration from '../../types/Decoration'
import DecorationRange from '../../types/DecorationRange'
import {
  annotate,
  clearAnnotation,
  clearBlockDecorations,
  clickDecoration,
  selectBlockText,
  selectMatch,
  setSel,
} from '../../utils/actionCreators'
import { identity } from '../../utils/common'
import SelectionUtils from '../../utils/SelectionUtils'
import './AnnotationEditorView.styl'
import './annotations.styl'
import Block from './Block'

export interface AnnotationEditorViewProps {
  setSel(decorationSet: Set<Decoration>): void
  selectBlockText(blockIndex: number): void
  clearBlockDecorations(blockIndex: number): void
  annotate(tag: string): void
  clearAnnotation(): void
  clickDecoration(decoration: Decoration, ctrlKey: boolean): void
  selectMatch(pattern: string | RegExp): void
}

class AnnotationEditorView extends React.Component<State & AnnotationEditorViewProps> {
  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)
  }

  getSnapshotBeforeUpdate() {
    return SelectionUtils.getCurrentRange()
  }

  componentDidUpdate(prevProps: any, prevState: any, snapshot: DecorationRange) {
    const currentRange = SelectionUtils.getCurrentRange()
    if (!is(currentRange, snapshot)) {
      SelectionUtils.setCurrentRange(snapshot)
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = (event: KeyboardEvent) => {
    // TODO 将逻辑移动到 saga 处
    const { annotate, clearAnnotation, setSel, doc, range } = this.props
    if (event.key === 'Escape') {
      this.clearSel()
    } else if (event.key === '1') {
      annotate('corporation')
    } else if (event.key === '2') {
      annotate('nation')
    } else if (event.key === '3') {
      annotate('time')
    } else if (event.key === '4') {
      annotate('concept')
    } else if (event.key === '5') {
      annotate('sentence')
    } else if (event.key === 's') {
      if (range) {
        const intersected = range
          .filterIntersected(doc.annotationSet)
          .map(Decoration.fromAnnotation)
        setSel(intersected)
      }
    } else if (event.key === 'Backspace' || event.key === 'd') {
      clearAnnotation()
    }
  }

  clearSel = () => {
    const { sel, setSel } = this.props
    setSel(sel.clear())
  }

  render() {
    const {
      doc,
      sel,
      annotate,
      clearAnnotation,
      clearBlockDecorations,
      selectBlockText,
      clickDecoration,
    } = this.props

    const decorationSet = doc.annotationSet.map(Decoration.fromAnnotation).toOrderedSet()
    const countMap = decorationSet
      .groupBy(decoration => decoration.range.blockIndex)
      .map(decSet => decSet.count())

    return (
      <div className="annotation-editor-view">
        <ButtonGroup style={{ margin: '16px 8px', flex: '0 0 auto' }}>
          <Popover
            content={
              <Menu>
                <MenuItem icon="annotation" text="标注工具" />
                <MenuItem icon="layout-grid" text="缩略图" />
                <MenuItem icon="timeline-bar-chart" text="统计图表" />
              </Menu>
            }
            position={Position.BOTTOM_LEFT}
            minimal
            transitionDuration={0}
          >
            <Button icon="annotation" text="标注工具" rightIcon="caret-down" />
          </Popover>
          <Button onClick={() => annotate('corporation')}>1 公司</Button>
          <Button onClick={() => annotate('nation')}>2 国家</Button>
          <Button onClick={() => annotate('time')}>3 时间点</Button>
          <Button onClick={() => annotate('concept')}>4 概念</Button>
          <Button onClick={() => annotate('sentence')}>5 句子</Button>
          <Button intent={Intent.DANGER} icon="trash" onClick={clearAnnotation}>
            删除标注
          </Button>
        </ButtonGroup>

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
  annotate,
  clearAnnotation,
  clickDecoration,
  selectMatch,
}

type Keyed<T> = { [key in keyof T]: any }
const enhancer = connect<State, Keyed<typeof mapDispatchToProps>>(identity, mapDispatchToProps)
export default enhancer(AnnotationEditorView)
