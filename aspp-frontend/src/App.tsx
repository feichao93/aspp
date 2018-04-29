import { hot } from 'react-hot-loader'
import { Set } from 'immutable'
import React from 'react'
import AnnotationEditorView from './AnnotationEditorView'
import { Annotation } from './types'
import * as testData from './testData'
import SelectionUtils from './SelectionUtils'

@hot(module)
export default class App extends React.Component {
  state = {
    annotatedDoc: testData.annotatedDoc,
  }

  add = (setToAdd: Set<Annotation>) => {
    const { annotatedDoc } = this.state
    const range = SelectionUtils.getCurrentRange()
    this.setState(
      { annotatedDoc: annotatedDoc.update('annotationSet', set => set.union(setToAdd)) },
      () => SelectionUtils.setCurrentRange(range),
    )
  }

  remove = (setToRemove: Set<Annotation>) => {
    const { annotatedDoc } = this.state
    const range = SelectionUtils.getCurrentRange()
    this.setState(
      { annotatedDoc: annotatedDoc.update('annotationSet', set => set.subtract(setToRemove)) },
      () => SelectionUtils.setCurrentRange(range),
    )
  }

  render() {
    const { annotatedDoc } = this.state
    return <AnnotationEditorView annotatedDoc={annotatedDoc} add={this.add} remove={this.remove} />
  }
}
