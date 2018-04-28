import { hot } from 'react-hot-loader'
import React from 'react'
import AnnotationEditorView from './AnnotationEditorView'
import * as testData from './testData'
import { Annotation } from './interfaces'

@hot(module)
export default class App extends React.Component {
  state = {
    annotatedDoc: testData.annotatedDoc,
  }

  annotate = (annotation: Annotation) => {
    console.log(annotation)
  }

  render() {
    const { annotatedDoc } = this.state
    return <AnnotationEditorView annotatedDoc={annotatedDoc} annotate={this.annotate} />
  }
}
