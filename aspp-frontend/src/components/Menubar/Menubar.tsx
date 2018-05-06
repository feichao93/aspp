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
  Switch,
} from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import './Menubar.styl'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { MiscState, State } from '../../reducer'
import { toggleDarkTheme, toggleTaskTreeVisibility } from '../../utils/actionCreators'

// TODO 完善状态栏
class Menubar extends React.Component<MiscState & { dispatch: Dispatch }> {
  render() {
    const { darkTheme, dispatch } = this.props
    return (
      <Navbar className={classNames('menubar')}>
        <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading>ASPP</NavbarHeading>
          <NavbarDivider />
          <Popover
            position={Position.TOP_LEFT}
            target={<Button minimal icon="document" text="file" />}
            content={
              <Menu>
                <MenuItem icon="new-text-box" text="New Task" />
                <MenuItem icon="document" text="New Doc" />
                <MenuDivider />
                <MenuItem text="Settings..." icon="cog" />
              </Menu>
            }
          />
          <Button minimal icon="edit" text="edit" />
          <Popover
            position={Position.TOP_LEFT}
            target={<Button minimal icon="eye-open" text="view" />}
            content={
              <Menu>
                <MenuItem
                  text="Toggle Task Tree"
                  onClick={() => dispatch(toggleTaskTreeVisibility())}
                />
              </Menu>
            }
          />
          <Button minimal icon="help" text="help" />
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Switch
            style={{ marginBottom: 0 }}
            checked={darkTheme}
            label="Dark Theme"
            onChange={() => dispatch(toggleDarkTheme())}
          />
        </NavbarGroup>
      </Navbar>
    )
  }
}

export default connect((s: State) => s.misc)(Menubar)
