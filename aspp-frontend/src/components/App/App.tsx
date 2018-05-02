import { hot } from 'react-hot-loader'
import React from 'react'
import AnnotationEditorView from '../AnnotationEditorView/AnnotationEditorView'
import './App.styl'
import Menubar from '../Menubar/Menubar'
import StatusBar from '../StatusBar/StatusBar'
import PanelContainer from '../panels/PanelContainer'

@hot(module)
export default class App extends React.Component {
  render() {
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
            <AnnotationEditorView />
          </div>
          <PanelContainer />
          <StatusBar />
        </div>
      </div>
    )
  }
}
