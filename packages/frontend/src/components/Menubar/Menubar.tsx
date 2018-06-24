import {
  Alignment,
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Popover,
  Position,
} from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { Config } from '../../reducers/configReducer'
import FileInfo from '../../types/FileInfo'
import Action from '../../utils/actions'
import HelpOverlay from '../HelpOverlay/HelpOverlay'
import './Menubar.styl'

export interface MenubarProps {
  config: Config
  fileInfo: FileInfo
  dispatch: Dispatch
}

class Menubar extends React.Component<MenubarProps> {
  onRequestChangeUsername = () => {
    const { dispatch } = this.props
    const username = window.prompt('Input your username')
    if (username) {
      dispatch(Action.setUsername(username))
    }
  }

  render() {
    const { config, fileInfo, dispatch } = this.props
    return (
      <Navbar className={classNames('menubar')}>
        <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading>ASPP {VERSION}</NavbarHeading>
          <NavbarDivider />
          <Popover
            position={Position.TOP_LEFT}
            target={<Button minimal icon="document" text="file" />}
            content={
              <Menu>
                <MenuItem disabled icon="document" text="New Doc" />
                <MenuDivider />
                <MenuItem disabled text="Settings..." icon="cog" />
              </Menu>
            }
          />
          <Button
            minimal
            icon="column-layout"
            text="Tree"
            onClick={() => dispatch(Action.toggleTaskTreeVisibility())}
          />
          <Button
            minimal
            icon="help"
            text="help"
            onClick={() => dispatch(Action.toggleHelpOverlay())}
          />
          <HelpOverlay />
          <div style={{ marginLeft: 24 }}>当前打开: {fileInfo.getFullName()}</div>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          {/*<Switch*/}
          {/*style={{ marginBottom: 0 }}*/}
          {/*checked={darkTheme}*/}
          {/*label="Dark Theme"*/}
          {/*onChange={() => dispatch(toggleDarkTheme())}*/}
          {/*/>*/}
          <Button
            minimal
            icon="user"
            text={config.username}
            onClick={this.onRequestChangeUsername}
          />
        </NavbarGroup>
      </Navbar>
    )
  }
}

function mapStateToProps(state: State) {
  return {
    config: state.config,
    fileInfo: state.fileInfo,
  }
}

export default connect(mapStateToProps)(Menubar)
