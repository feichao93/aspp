import React from 'react'
import './Menubar.styl'

// TODO 完善状态栏
export default class Menubar extends React.Component {
  render() {
    return (
      <div className="menubar" tabIndex={1}>
        <div className="category">
          <div className="title" data-category="File">
            File
          </div>
          <ol className="menu-item-list" style={{ display: 'none' }}>
            <li className="menu-item" data-intent="save">
              <p>Save as JSON</p>
              <p className="hint" />
            </li>
            <li className="menu-item" data-intent="load-data">
              <p>Load JSON</p>
              <p className="hint" />
            </li>
            <li className="menu-item disabled">
              <p>Export as SVG</p>
              <p className="hint" />
            </li>
            <li className="menu-item" data-intent="load-image">
              <p>Load Image</p>
              <p className="hint" />
            </li>
          </ol>
        </div>
        <div className="category">
          <div className="title" data-category="Edit">
            Edit
          </div>
          <ol className="menu-item-list" style={{ display: 'none' }}>
            <li className="menu-item disabled" data-intent="undo">
              <p>Undo</p>
              <p className="hint">Ctrl+Z</p>
            </li>
            <li className="menu-item disabled" data-intent="redo">
              <p>Redo</p>
              <p className="hint">Ctrl+Y</p>
            </li>
            <hr className="seprator" />
            <li className="menu-item disabled" data-intent="delete">
              <p>Delete Selection</p>
              <p className="hint">D</p>
            </li>
            <li className="menu-item disabled" data-intent="toggle-lock">
              <p>Toggle Lock</p>
              <p className="hint">B</p>
            </li>
            <li className="menu-item" data-intent="toggle-sel-mode">
              <p>Toggle Selection Mode</p>
              <p className="hint">E</p>
            </li>
            <hr className="seprator" />
            <li className="menu-item" data-intent="rect">
              <p>Add Rectangle</p>
              <p className="hint">R</p>
            </li>
            <li className="menu-item" data-intent="polygon">
              <p>Add Polygon</p>
              <p className="hint">P</p>
            </li>
            <li className="menu-item" data-intent="line">
              <p>Add Line</p>
              <p className="hint">L</p>
            </li>
          </ol>
        </div>
        <div className="category">
          <div className="title" data-category="View">
            View
          </div>
          <ol className="menu-item-list" style={{ display: 'none' }}>
            <li className="menu-item disabled" data-intent="zoom-to-sel">
              <p>Centralize Selection</p>
              <p className="hint">Num 1</p>
            </li>
            <li className="menu-item" data-intent="zoom-to-fit">
              <p>Fit</p>
              <p className="hint">Num 2</p>
            </li>
            <li className="menu-item" data-intent="reset-zoom">
              <p>Reset Zoom</p>
              <p className="hint">Num 3</p>
            </li>
          </ol>
        </div>
        <div className="category">
          <div className="title" data-category="Help">
            Help
          </div>
          <ol className="menu-item-list" style={{ display: 'none' }}>
            <li className="menu-item" data-intent="show-about">
              <p>About</p>
              <p className="hint" />
            </li>
            <li className="menu-item" data-intent="show-shortcut">
              <p>Shortcut</p>
              <p className="hint" />
            </li>
          </ol>
        </div>
      </div>
    )
  }
}
