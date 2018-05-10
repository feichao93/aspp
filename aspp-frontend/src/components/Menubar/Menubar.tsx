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
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { MiscState } from '../../reducers/miscReducer'
import {
  loadFileContent,
  requestDownloadResult,
  toggleDarkTheme,
  toggleTaskTreeVisibility,
} from '../../utils/actionCreators'
import './Menubar.styl'

// TODO 完善状态栏
class Menubar extends React.Component<MiscState & { dispatch: Dispatch }> {
  onRequestOpenFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.click()
    input.onchange = () => {
      const file = input.files[0]
      const fileReader = new FileReader()
      fileReader.readAsText(file)
      fileReader.onload = () => {
        this.props.dispatch(loadFileContent(fileReader.result))
      }
    }
  }

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
                <MenuItem
                  icon="cloud-download"
                  text="Download Result"
                  onClick={() => dispatch(requestDownloadResult())}
                />
                <MenuItem icon="document-open" text="Open" onClick={this.onRequestOpenFile} />
                <MenuItem disabled icon="document" text="New Doc" />
                <MenuDivider />
                <MenuItem disabled text="Settings..." icon="cog" />
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
