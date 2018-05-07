import { Classes } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import { hot } from 'react-hot-loader'
import { connect } from 'react-redux'
import { State } from '../../reducers'
import { MiscState } from '../../reducers/miscReducer'
import AnnotationEditorView from '../AnnotationEditorView/AnnotationEditorView'
import Menubar from '../Menubar/Menubar'
import PanelContainer from '../panels/PanelContainer'
import StatusBar from '../StatusBar/StatusBar'
import TaskTree from '../TaskTree/TaskTree'
import './App.styl'

@hot(module)
@(connect as any)((s: State) => s.misc)
export default class App extends React.Component<Partial<MiscState>> {
  render() {
    const { darkTheme } = this.props
    return (
      <div className={classNames('app', { [Classes.DARK]: darkTheme })}>
        <div className="overlay" />
        <div className="app-content">
          <Menubar />
          <TaskTree />
          <AnnotationEditorView />
          <PanelContainer />
          <StatusBar />
        </div>
      </div>
    )
  }
}
