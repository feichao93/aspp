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
  clickDecoration,
  selectMatch,
  setRange,
  setSel,
} from '../../utils/actionCreators'
import { identity } from '../../utils/common'
import layout from '../../utils/layout'
import SelectionUtils from '../../utils/SelectionUtils'
import './AnnotationEditorView.styl'
import './annotations.styl'
import Span from './Span'

export interface AnnotationEditorViewProps {
  setSel(decorationSet: Set<Decoration>): void
  setRange(range: DecorationRange): void
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
    const { annotate, clearAnnotation } = this.props
    if (event.key === 'Escape') {
      this.clearSel()
    } else if (event.key === '1') {
      annotate('role')
    } else if (event.key === '2') {
      annotate('item')
    } else if (event.key === '3') {
      annotate('time')
    } else if (event.key === '4') {
      annotate('action')
    } else if (event.key === 'Backspace') {
      clearAnnotation()
    }
  }

  clearSel = () => {
    const { sel, setSel } = this.props
    setSel(sel.clear())
  }

  render() {
    const { doc, sel, range, annotate, clearAnnotation, clickDecoration } = this.props

    const decorationSet = doc.annotationSet.map(Decoration.fromAnnotation).toOrderedSet()

    return (
      <div className="view annotation-editor-view">
        <ButtonGroup style={{ margin: '16px 8px', display: 'flex' }}>
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
          <Button onClick={() => annotate('role')}>1 角色</Button>
          <Button onClick={() => annotate('item')}>2 道具</Button>
          <Button onClick={() => annotate('time')}>3 时间点</Button>
          <Button onClick={() => annotate('action')}>4 动作</Button>
          <Button intent={Intent.DANGER} icon="trash" onClick={clearAnnotation}>
            删除标注
          </Button>
        </ButtonGroup>

        <div className="editor">
          {doc.plainDoc.blocks.map((block, blockIndex) => (
            <div key={blockIndex} className="block" data-block data-blockindex={blockIndex}>
              {layout(block, blockIndex, decorationSet).map((spanInfo, index) => (
                <Span
                  key={index}
                  info={spanInfo}
                  onMouseDown={clickDecoration}
                  isSelected={(decoration: Decoration) => sel.includes(decoration)}
                  block={block}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  setSel,
  setRange,
  annotate,
  clearAnnotation,
  clickDecoration,
  selectMatch,
}

type Keyed<T> = { [key in keyof T]: any }
const enhancer = connect<State, Keyed<typeof mapDispatchToProps>>(identity, mapDispatchToProps)
export default enhancer(AnnotationEditorView)
