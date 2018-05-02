import { hot } from 'react-hot-loader'
import { Set } from 'immutable'
import React from 'react'
import AnnotationEditorView from '../AnnotationEditorView/AnnotationEditorView'
import * as testData from '../../testData'
import SelectionUtils from '../../SelectionUtils'
import './App.styl'
import Menubar from '../Menubar/Menubar'
import StatusBar from '../StatusBar/StatusBar'
import Annotation from '../../types/Annotation'
import PanelContainer from '../panels/PanelContainer'

@hot(module)
export default class App extends React.Component {
  state = {
    annotatedDoc: testData.annotatedDoc,
  }

  add = (setToAdd: Set<Annotation>) => {
    const { annotatedDoc } = this.state
    const updatedDoc = annotatedDoc.update('annotationSet', set => set.union(setToAdd))
    SelectionUtils.keepRange(cont => this.setState({ annotatedDoc: updatedDoc }, cont))
  }

  addOne = (annotation: Annotation) => {
    this.add(Set.of(annotation))
  }

  remove = (setToRemove: Set<Annotation>) => {
    const { annotatedDoc } = this.state
    const updatedDoc = annotatedDoc.update('annotationSet', set => set.subtract(setToRemove))
    SelectionUtils.keepRange(cont => {
      this.setState({ annotatedDoc: updatedDoc }, cont)
    })
  }

  removeOne = (annotation: Annotation) => {
    this.remove(Set.of(annotation))
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
          <div className="view-container" style={{ gridArea: 'view' }}>
            <AnnotationEditorView
              doc={annotatedDoc}
              add={this.add}
              remove={this.remove}
              addOne={this.addOne}
              removeOne={this.removeOne}
            />
          </div>
          <PanelContainer />
          <StatusBar />
        </div>
      </div>
    )
  }
}
