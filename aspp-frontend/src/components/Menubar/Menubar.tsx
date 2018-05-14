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
import MainState from '../../types/MainState'
import {
  loadFileContent,
  requestDownloadResult,
  toggleDarkTheme,
  toggleTaskTreeVisibility,
} from '../../utils/actionCreators'
import './Menubar.styl'

export interface MenubarProps {
  misc: MiscState
  main: MainState
  dispatch: Dispatch
}

// TODO 完善状态栏
class Menubar extends React.Component<MenubarProps> {
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
    const {
      misc: { darkTheme },
      main,
      dispatch,
    } = this.props
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
                  icon="download"
                  text="Download Result (json)"
                  onClick={() => dispatch(requestDownloadResult('json'))}
                />
                <MenuItem
                  icon="download"
                  text="Download Result (bio)"
                  onClick={() => dispatch(requestDownloadResult('bio'))}
                />
                <MenuItem icon="document-open" text="Open" onClick={this.onRequestOpenFile} />
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
          <Button minimal icon="help" text="help" />
          <div style={{ marginLeft: 24 }}>
            当前文件名: {main.docname} {main.annotationSetName}
          </div>
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

export default connect((s: State) => ({ misc: s.misc, main: s.main }))(Menubar)
