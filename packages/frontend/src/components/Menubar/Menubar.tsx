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
import { MiscState } from '../../reducers/miscReducer'
import MainState from '../../types/MainState'
import {
  setUsername,
  toggleHelpOverlay,
  toggleTaskTreeVisibility,
} from '../../utils/actionCreators'
import HelpOverlay from '../HelpOverlay/HelpOverlay'
import './Menubar.styl'

export interface MenubarProps {
  misc: MiscState
  main: MainState
  dispatch: Dispatch
}

class Menubar extends React.Component<MenubarProps> {
  onRequestChangeUsername = () => {
    const { dispatch } = this.props
    const username = window.prompt('Input your username')
    if (username) {
      dispatch(setUsername(username))
    }
  }

  render() {
    const {
      misc: { username },
      main,
      dispatch,
    } = this.props
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
            onClick={() => dispatch(toggleTaskTreeVisibility())}
          />
          <Button minimal icon="help" text="help" onClick={() => dispatch(toggleHelpOverlay())} />
          <HelpOverlay />
          <div style={{ marginLeft: 24 }}>
            当前文件名: {main.docname} {main.collName}
          </div>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          {/*<Switch*/}
          {/*style={{ marginBottom: 0 }}*/}
          {/*checked={darkTheme}*/}
          {/*label="Dark Theme"*/}
          {/*onChange={() => dispatch(toggleDarkTheme())}*/}
          {/*/>*/}
          <Button minimal icon="user" text={username} onClick={this.onRequestChangeUsername} />
        </NavbarGroup>
      </Navbar>
    )
  }
}

export default connect((s: State) => ({ misc: s.misc, main: s.main }))(Menubar)
