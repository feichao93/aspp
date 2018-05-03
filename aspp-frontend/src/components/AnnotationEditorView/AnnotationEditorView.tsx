import { is, Set } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { State } from '../../reducer'
import AnnotatedDoc from '../../types/AnnotatedDoc'
import Decoration from '../../types/Decoration'
import DecorationRange from '../../types/DecorationRange'
import DecorationSet from '../../types/DecorationSet'
import {
  annotate,
  clearAnnotation,
  clickDecoration,
  selectMatch,
  setRange,
  setSel,
} from '../../utils/actionCreators'
import { identity, preventDefault } from '../../utils/common'
import SelectionUtils from '../../utils/SelectionUtils'
import './AnnotationEditorView.styl'
import './annotations.styl'
import Span from './Span'

export interface AnnotationEditorViewProps {
  doc: AnnotatedDoc
  sel: Set<Decoration>
  range: DecorationRange
  setSel(decorationSet: Set<Decoration>): void
  setRange(range: DecorationRange): void
  annotate(tag: string): void
  clearAnnotation(): void
  clickDecoration(decoration: Decoration, ctrlKey: boolean): void
  selectMatch(pattern: string | RegExp): void
}

class AnnotationEditorView extends React.Component<AnnotationEditorViewProps> {
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
    const selectedText = DecorationRange.getText(doc, range)

    const decorationSet = DecorationSet.fromDoc(doc).addSel(sel)

    return (
      <div className="view annotation-editor-view">
        <div className="button-group" style={{ margin: '16px 0' }}>
          <h3>标注工具</h3>
          <button onMouseDown={preventDefault} onClick={() => annotate('role')}>
            (1)<span className="annotation role">角色</span>
          </button>
          <button onMouseDown={preventDefault} onClick={() => annotate('item')}>
            (2)<span className="annotation item">道具</span>
          </button>
          <button onMouseDown={preventDefault} onClick={() => annotate('time')}>
            (3)<span className="annotation time">时间点</span>
          </button>
          <button onMouseDown={preventDefault} onClick={() => annotate('action')}>
            (4)<span className="annotation action">动作</span>
          </button>
          <button style={{ marginLeft: 16 }} onMouseDown={preventDefault} onClick={clearAnnotation}>
            清除标注
          </button>
        </div>

        <div className="editor">
          {doc.plainDoc.blocks.map((block, blockIndex) => (
            <div key={blockIndex} className="block" data-block data-blockindex={blockIndex}>
              {decorationSet
                .highlightMatch(block, blockIndex, selectedText)
                .completeTexts(block, blockIndex)
                .map((decoration, index) => (
                  <Span
                    key={index}
                    decoration={decoration}
                    onClick={clickDecoration}
                    selected={sel.includes(decoration)}
                  >
                    {DecorationRange.getText(doc, decoration.range)}
                  </Span>
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
