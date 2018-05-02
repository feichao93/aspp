import React from 'react'
import { hot } from 'react-hot-loader'
import AnnotationEditorView from '../AnnotationEditorView/AnnotationEditorView'
import Menubar from '../Menubar/Menubar'
import PanelContainer from '../panels/PanelContainer'
import StatusBar from '../StatusBar/StatusBar'
import './App.styl'

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
              {/* TODO */}
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
