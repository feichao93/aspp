import React from 'react'
import { List, Set } from 'immutable'
import { getNextId, preventDefault } from '../../utils'
import SelectionUtils from '../../SelectionUtils'
import './AnnotationEditorView.styl'
import './annotations.styl'
import DecorationSet, { Decoration } from '../../types/DecorationSet'
import AnnotatedDoc from '../../types/AnnotatedDoc'
import Annotation from '../../types/Annotation'

export interface AnnotationEditorViewProps {
  doc: AnnotatedDoc
  add(annotationSet: Set<Annotation>): void
  addOne(annotation: Annotation): void
  remove(annotationSet: Set<Annotation>): void
  removeOne(annotation: Annotation): void
}

export interface AnnotationEditorViewState {
  selectedText: string
  selection: Set<Decoration>
}

class Span extends React.Component<{ decoration: Decoration; block: string }> {
  render() {
    const { decoration, children } = this.props
    const { range } = decoration
    if (decoration.type === 'text') {
      return (
        <span className="text" data-offset={range.startOffset}>
          {children}
        </span>
      )
    } else if (decoration.type === 'annotation') {
      const annotation = decoration.annotation
      return (
        <span
          className={['annotation', annotation.tag].join(' ')}
          data-annotationid={annotation ? annotation.id : undefined}
          data-offset={range.startOffset}
        >
          {children}
        </span>
      )
    } else if (decoration.type === 'hint') {
      return (
        <span className="hint" data-offset={range.startOffset}>
          {children}
        </span>
      )
    } else if (decoration.type === 'slot') {
      return (
        <span className={['slot', decoration.slotType].join(' ')} data-offset={range.startOffset}>
          {children}
        </span>
      )
    } else {
      throw new Error('invalid decoration')
    }
  }
}

export default class AnnotationEditorView extends React.Component<
  AnnotationEditorViewProps,
  AnnotationEditorViewState
> {
  off: () => void

  componentDidMount() {
    this.off = SelectionUtils.on(this.onSelectionChange)
    document.addEventListener('keypress', this.onKeyPress)
  }

  componentWillUnmount() {
    this.off()
    document.removeEventListener('keypress', this.onKeyPress)
  }

  onKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'a') {
      this.addHighlightToSelection()
    } else if (event.key === 'c') {
      this.clearSelection()
    } else if (event.key === '1') {
      this.annotateFactory('role')()
    } else if (event.key === '2') {
      this.annotateFactory('item')()
    } else if (event.key === '3') {
      this.annotateFactory('time')()
    } else if (event.key === '4') {
      this.annotateFactory('action')()
    } else if (event.key === '`') {
      this.removeCurrentAnnotations()
    }
  }

  state = {
    selectedText: '',
    selection: Set<Decoration>(),
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
    const { add } = this.props
    const { selection } = this.state
    if (selection.isEmpty()) {
      const range = SelectionUtils.getCurrentRange()
      if (range) {
        add(
          Set.of(
            new Annotation({
              tag,
              range: range.normalize(),
              confidence: 1,
              id: getNextId('annotation'),
            }),
          ),
        )
      } else {
        // TODO make a toast showing 'invalid selection'
        console.log('invalid selection')
      }
    } else {
      add(
        selection.map(
          slot =>
            new Annotation({
              tag,
              range: slot.range,
              confidence: 1,
              id: getNextId('annotation'),
            }),
        ),
      )
      this.setState({ selection: selection.clear() })
    }
  }

  addHighlightToSelection = () => {
    const { doc } = this.props
    const { selectedText, selection } = this.state
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
    SelectionUtils.setCurrentRange(null)
    this.setState({ selection: selection.union(highlightSlots) })
  }

  clearSelection = () => {
    this.setState({ selection: this.state.selection.clear() })
  }

  removeCurrentAnnotations = () => {
    const { doc, remove } = this.props
    const range = SelectionUtils.getCurrentRange()
    if (range == null) {
      console.log('invalid range')
    } else {
      remove(range.normalize().intersect(doc.annotationSet))
    }
  }

  render() {
    const { doc } = this.props
    const { selectedText, selection } = this.state

    const decorationSet = DecorationSet.fromDoc(doc)

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
            (`)清除标注
          </button>
        </div>
        <div className="button-group" style={{ marginBottom: 16 }}>
          <h3>selection operations</h3>
          <button onMouseDown={preventDefault} onClick={this.clearSelection}>
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
                .addSelection(selection)
                .highlightMatch(block, blockIndex, selectedText)
                .completeTexts(block, blockIndex)
                .map((decoration, index) => (
                  <Span key={index} block={block} decoration={decoration}>
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
