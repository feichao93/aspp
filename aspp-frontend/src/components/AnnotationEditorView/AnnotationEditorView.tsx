import { is, List, Set } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { State } from '../../reducer'
import AnnotatedDoc from '../../types/AnnotatedDoc'
import Annotation from '../../types/Annotation'
import DecorationRange from '../../types/DecorationRange'
import DecorationSet, { Decoration } from '../../types/DecorationSet'
import {
  addAnnotationSet,
  addOneAnnotation,
  removeAnnotationSet,
  removeOneAnnotation,
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
  add(annotationSet: Set<Annotation>): void
  addOne(annotation: Annotation): void
  remove(annotationSet: Set<Annotation>): void
  removeOne(annotation: Annotation): void
  setSel(decorationSet: Set<Decoration>): void
  setRange(range: DecorationRange): void
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
    if (event.key === 'a') {
      this.addHighlightToSelection()
    } else if (event.key === 'c') {
      this.clearSel()
    } else if (event.key === '1') {
      this.annotateFactory('role')()
    } else if (event.key === '2') {
      this.annotateFactory('item')()
    } else if (event.key === '3') {
      this.annotateFactory('time')()
    } else if (event.key === '4') {
      this.annotateFactory('action')()
    } else if (event.key === 'Backspace') {
      this.removeCurrentAnnotations()
    }
  }

  onClickDecoration = (event: React.MouseEvent<HTMLSpanElement>, decoration: Decoration) => {
    const { sel, setSel } = this.props
    if (decoration.type === 'slot') {
      if (decoration.slotType === 'selection') {
        if (event.ctrlKey) {
          setSel(sel.delete(decoration))
        }
      }
    }
  }

  annotateFactory = (tag: string) => () => {
    // TODO 有优化交互的空间
    const { add, addOne, sel, range } = this.props
    if (sel.isEmpty()) {
      if (range) {
        addOne(Annotation.tagRange(tag, range.normalize()))
      } else {
        // TODO make a toast showing 'invalid selection'
        console.log('invalid selection')
      }
    } else {
      add(Annotation.tagSel(tag, sel))
      this.clearSel()
    }
  }

  addHighlightToSelection = () => {
    const { doc, sel, setSel, range } = this.props
    const selectedText = DecorationRange.getText(doc, range)

    if (selectedText === '') {
      return
    }

    const decorationSet = DecorationSet.fromDoc(doc)
    const highlightSlots = List(doc.plainDoc.blocks)
      .flatMap((block, blockIndex) =>
        decorationSet
          .highlightMatch(block, blockIndex, selectedText)
          .decSet.filter(
            decoration => decoration.type === 'slot' && decoration.slotType === 'highlight',
          ),
      )
      .map(slot => Object.assign({}, slot, { slotType: 'selection' }))
    setSel(sel.union(highlightSlots))
    setRange(null)
  }

  clearSel = () => {
    const { sel, setSel } = this.props
    setSel(sel.clear())
  }

  removeCurrentAnnotations = () => {
    const { doc, remove, range } = this.props
    if (range == null) {
      console.log('invalid range')
    } else {
      remove(range.intersect(doc.annotationSet))
    }
  }

  render() {
    const { doc, sel, range } = this.props
    const selectedText = DecorationRange.getText(doc, range)

    const decorationSet = DecorationSet.fromDoc(doc).addSel(sel)

    return (
      <div className="view annotation-editor-view">
        <div className="button-group" style={{ margin: '16px 0' }}>
          <h3>标注工具</h3>
          <button onMouseDown={preventDefault} onClick={this.annotateFactory('role')}>
            (1)<span className="annotation role">角色</span>
          </button>
          <button onMouseDown={preventDefault} onClick={this.annotateFactory('item')}>
            (2)<span className="annotation item">道具</span>
          </button>
          <button onMouseDown={preventDefault} onClick={this.annotateFactory('time')}>
            (3)<span className="annotation time">时间点</span>
          </button>
          <button onMouseDown={preventDefault} onClick={this.annotateFactory('action')}>
            (4)<span className="annotation action">动作</span>
          </button>
          <button
            style={{ marginLeft: 16 }}
            onMouseDown={preventDefault}
            onClick={this.removeCurrentAnnotations}
          >
            清除标注
          </button>
        </div>
        <div className="button-group" style={{ marginBottom: 16 }}>
          <h3>selection operations</h3>
          <button onMouseDown={preventDefault} onClick={this.clearSel}>
            (c)clear
          </button>
          <button
            onMouseDown={preventDefault}
            onClick={this.addHighlightToSelection}
            style={{ marginLeft: 8 }}
          >
            (a)add highlighted
          </button>
        </div>

        <div className="editor">
          {doc.plainDoc.blocks.map((block, blockIndex) => (
            <div key={blockIndex} data-block data-blockindex={blockIndex}>
              {decorationSet
                .highlightMatch(block, blockIndex, selectedText)
                .completeTexts(block, blockIndex)
                .map((decoration, index) => (
                  <Span
                    key={index}
                    block={block}
                    decoration={decoration}
                    onClick={this.onClickDecoration}
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
  add: addAnnotationSet,
  addOne: addOneAnnotation,
  remove: removeAnnotationSet,
  removeOne: removeOneAnnotation,
  setSel,
  setRange,
}

type Keyed<T> = { [key in keyof T]: any }
const enhancer = connect<State, Keyed<typeof mapDispatchToProps>>(identity, mapDispatchToProps)
export default enhancer(AnnotationEditorView)
