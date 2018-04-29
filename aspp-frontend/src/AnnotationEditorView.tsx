import React from 'react'
import { Set } from 'immutable'
import AnnotationEditor from './AnnotationEditor'
import AnnotateButton from './AnnotateButton'
import { AnnotatedDoc, Annotation } from './types'
import { preventDefault } from './utils'
import SelectionUtils from './SelectionUtils'
import DecorationUtils from './DecorationUtils'

export interface AnnotationEditorViewProps {
  annotatedDoc: AnnotatedDoc
  add: (annotationSet: Set<Annotation>) => void
  remove: (annotationSet: Set<Annotation>) => void
}

export interface AnnotationEditorViewState {
  doc: AnnotatedDoc
}

export default class AnnotationEditorView extends React.Component<AnnotationEditorViewProps> {
  static getDerivedStateFromProps(
    nextProps: AnnotationEditorViewProps,
    prevState: AnnotationEditorViewState,
  ) {
    if (prevState.doc == null) {
      return { doc: nextProps.annotatedDoc }
    }
    return null
  }

  off: () => void

  componentDidMount() {
    this.off = SelectionUtils.on(this.onSelectionChange)
  }

  componentWillUnmount() {
    this.off()
  }

  state = {
    doc: null as AnnotatedDoc,
  }

  onSelectionChange = () => {
    const { annotatedDoc } = this.props
    const range = SelectionUtils.getCurrentRange()
    if (range) {
      const block = annotatedDoc.plainDoc.blocks.get(range.blockIndex)
      const selectedText = range.getSelectedText(block)

      this.setState({ doc: DecorationUtils.highlightMatch(annotatedDoc, selectedText) }, () =>
        SelectionUtils.setCurrentRange(range),
      )
    } else {
      this.setState({ doc: annotatedDoc })
    }
  }

  clear = () => {
    const { annotatedDoc, remove } = this.props
    const range = SelectionUtils.getCurrentRange()
    if (range == null) {
      console.log('invalid range')
    } else {
      const setToRemove = range.intersect(annotatedDoc.annotationSet)
      remove(setToRemove)
    }
  }

  render() {
    const { annotatedDoc, add } = this.props
    const { doc } = this.state

    return (
      <div>
        <div className="annotation-button-group" style={{ marginBottom: 16 }}>
          <AnnotateButton label="角色" tag="role" annotate={one => add(Set.of(one))} />
          <AnnotateButton label="道具" tag="item" annotate={one => add(Set.of(one))} />
          <AnnotateButton label="转换为确认的" tag="confirmed" annotate={one => add(Set.of(one))} />
          <button style={{ marginLeft: 16 }} onMouseDown={preventDefault} onClick={this.clear}>
            清除标注
          </button>
        </div>
        <div className="editor-wrapper">
          <AnnotationEditor doc={doc} />
        </div>
      </div>
    )
  }
}
