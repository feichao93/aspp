import { hot } from 'react-hot-loader'
import { Set } from 'immutable'
import React from 'react'
import AnnotationEditorView from '../AnnotationEditorView/AnnotationEditorView'
import { Annotation } from '../../types/index'
import * as testData from '../../testData'
import SelectionUtils from '../../SelectionUtils'
import './App.styl'
import Menubar from '../Menubar/Menubar'
import StatusBar from '../StatusBar/StatusBar'

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

    return (
      <div className="app">
        <div className="overlay" />
        <div className="app-content">
          <Menubar />
          <div className="navigator">
            <div
              style={{
                background: '#afc4e1',
                width: 200,
                height: '100%',
                fontSize: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              navigator
            </div>
          </div>
          <div className="view">
            <AnnotationEditorView annotatedDoc={annotatedDoc} add={this.add} remove={this.remove} />
          </div>
          <div className="panel">
            <div
              style={{
                background: '#ff9577',
                width: 300,
                height: '100%',
                fontSize: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              panel
            </div>
          </div>
          <StatusBar />
        </div>
      </div>
    )
  }
}
