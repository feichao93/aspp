import { hot } from 'react-hot-loader'
import React from 'react'
import AnnotationEditorView from './AnnotationEditorView'
import { Annotation } from './types'
import * as testData from './testData'
import { setCurrentRange } from './SelectionUtils'

@hot(module)
export default class App extends React.Component {
  state = {
    annotatedDoc: testData.annotatedDoc,
  }

  annotate = (annotation: Annotation) => {
    const { annotatedDoc } = this.state
    const afterAnnotation = annotatedDoc.set(
      'annotationSet',
      annotatedDoc.annotationSet.add(annotation),
    )
    this.setState({ annotatedDoc: afterAnnotation }, () => setCurrentRange(annotation.range))
  }

  render() {
    const { annotatedDoc } = this.state
    return <AnnotationEditorView annotatedDoc={annotatedDoc} annotate={this.annotate} />
  }
}
