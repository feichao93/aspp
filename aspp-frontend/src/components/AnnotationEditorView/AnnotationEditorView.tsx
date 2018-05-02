import React from 'react'
import { connect } from 'react-redux'
import { List, Set } from 'immutable'
import { getNextId, identity, preventDefault } from '../../utils'
import SelectionUtils from '../../SelectionUtils'
import './AnnotationEditorView.styl'
import './annotations.styl'
import DecorationSet, { Decoration } from '../../types/DecorationSet'
import AnnotatedDoc from '../../types/AnnotatedDoc'
import Annotation from '../../types/Annotation'
import { State } from '../../reducer'
import Action from '../../actions'
import Span from './Span'

export interface AnnotationEditorViewProps {
  doc: AnnotatedDoc
  sel: Set<Decoration>
  add(annotationSet: Set<Annotation>): void
  addOne(annotation: Annotation): void
  remove(annotationSet: Set<Annotation>): void
  removeOne(annotation: Annotation): void
  setSel(decorationSet: Set<Decoration>): void
}

export interface AnnotationEditorViewState {
  selectedText: string
}

class AnnotationEditorView extends React.Component<
  AnnotationEditorViewProps,
  AnnotationEditorViewState
> {
  off: () => void
  didUpdateCallback: any = null

  componentDidMount() {
    this.off = SelectionUtils.on(this.onSelectionChange)
    document.addEventListener('keydown', this.onKeyDown)
  }

  componentDidUpdate() {
    if (this.didUpdateCallback) {
      const callback = this.didUpdateCallback
      this.didUpdateCallback = null
      callback()
    }
  }

  componentWillUnmount() {
    this.off()
    document.removeEventListener('keydown', this.onKeyDown)
    this.didUpdateCallback = null
  }

  state = {
    selectedText: '',
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

  onSelectionChange = () => {
    const { doc } = this.props
    const range = SelectionUtils.getCurrentRange()
    if (range) {
      const block = doc.plainDoc.blocks.get(range.blockIndex)
      const selectedText = range.getText(block)
      SelectionUtils.keepRange(cont => this.setState({ selectedText }, cont))
    } else {
      this.setState({ selectedText: '' })
    }
  }

  annotateFactory = (tag: string) => () => {
    const { add, addOne, sel } = this.props
    if (sel.isEmpty()) {
      const range = SelectionUtils.getCurrentRange()
      if (range) {
        addOne(
          new Annotation({
            tag,
            range: range.normalize(),
            confidence: 1,
            id: getNextId('annotation'),
          }),
        )
      } else {
        // TODO make a toast showing 'invalid selection'
        console.log('invalid selection')
      }
    } else {
      add(
        sel.map(
          slot =>
            new Annotation({
              tag,
              range: slot.range,
              confidence: 1,
              id: getNextId('annotation'),
            }),
        ),
      )
      this.clearSel()
    }
  }

  addHighlightToSelection = () => {
    const { doc, sel, setSel } = this.props
    const { selectedText } = this.state
    if (selectedText.length === 0) {
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
    SelectionUtils.setCurrentRange(null)
  }

  clearSel = () => {
    const { sel, setSel } = this.props
    setSel(sel.clear())
  }

  removeCurrentAnnotations = () => {
    const { doc, remove } = this.props
    const range = SelectionUtils.getCurrentRange()
    if (range == null) {
      console.log('invalid range')
    } else {
      remove(range.normalize().intersect(doc.annotationSet))
      SelectionUtils.scheduleSetCurrentRange(range)
    }
  }

  render() {
    const { doc, sel } = this.props
    const { selectedText } = this.state

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
                    {decoration.range.getText(block)}
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
  add(setToAdd: Set<Annotation>) {
    return {
      type: 'ADD_ANNOTATION_SET',
      setToAdd,
    } as Action.AddAnnotationSet
  },
  addOne(annotation: Annotation) {
    return {
      type: 'ADD_ANNOTATION_SET',
      setToAdd: Set.of(annotation),
    } as Action.AddAnnotationSet
  },
  remove(setToRemove: Set<Annotation>) {
    return {
      type: 'REMOVE_ANNOTATION_SET',
      setToRemove,
    } as Action.RemoveAnnotationSet
  },
  removeOne(annotation: Annotation) {
    return {
      type: 'REMOVE_ANNOTATION_SET',
      setToRemove: Set.of(annotation),
    } as Action.RemoveAnnotationSet
  },
  setSel(sel: Set<Decoration>): Action.SetSel {
    return { type: 'SET_SEL', sel }
  },
}

type Keyed<T> = { [key in keyof T]: any }
const enhancer = connect<State, Keyed<typeof mapDispatchToProps>>(identity, mapDispatchToProps)
export default enhancer(AnnotationEditorView)
