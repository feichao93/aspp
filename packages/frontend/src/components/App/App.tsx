import { Classes } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import { hot } from 'react-hot-loader'
import { connect } from 'react-redux'
import { State } from '../../reducers'
import { Config } from '../../reducers/configReducer'
import DialogContainer from '../dialogs/DialogContainer'
import TaskTree from '../FileTree/FileTree'
import HelpOverlay from '../HelpOverlay/HelpOverlay'
import Menubar from '../Menubar/Menubar'
import PanelContainer from '../panels/PanelContainer'
import ViewContainer from '../ViewContainer/ViewContainer'
import './App.styl'

@hot(module)
@(connect as any)((s: State) => ({ config: s.config }))
export default class App extends React.Component<{ config?: Config }> {
  render() {
    const { config } = this.props
    return (
      <div className={classNames('app', { [Classes.DARK]: config.useDarkTheme })}>
        <div className="overlay" />
        <div className="app-content">
          <Menubar />
          <TaskTree />
          <ViewContainer />
          <PanelContainer />
        </div>
        <HelpOverlay />
        <DialogContainer />
      </div>
    )
  }
}
