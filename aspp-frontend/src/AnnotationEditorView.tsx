import React from 'react'
import AnnotationEditor from './AnnotationEditor'
import AnnotateButton from './AnnotateButton'
import { AnnotatedDoc, Annotation } from './interfaces'
import { preventDefault } from './utils'

export interface AnnotationEditorViewProps {
  annotatedDoc: AnnotatedDoc
  annotate: (annotation: Annotation) => void
}

export default class AnnotationEditorView extends React.Component<AnnotationEditorViewProps> {
  clear = () => {
    // TODO
  }

  render() {
    const { annotatedDoc, annotate } = this.props

    return (
      <div>
        <div className="annotation-button-group" style={{ marginBottom: 16 }}>
          <AnnotateButton label="角色" tag="role" annotate={annotate} />
          <AnnotateButton label="道具" tag="item" annotate={annotate} />
          <AnnotateButton label="转换为确认的" tag="confirmed" annotate={annotate} />
          <button style={{ marginLeft: 16 }} onMouseDown={preventDefault} onClick={this.clear}>
            清除标注
          </button>
          <button style={{ marginLeft: 16 }} onMouseDown={null}>
            测试按钮
          </button>
        </div>
        <div className="editor-wrapper">
          <AnnotationEditor doc={annotatedDoc} />
        </div>
      </div>
    )
  }
}
