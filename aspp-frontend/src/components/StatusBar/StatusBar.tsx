import React from 'react'
import './StatusBar.styl'

export default class StatusBar extends React.Component {
  render() {
    return (
      <div className="status-bar">
        <div className="left">
          <p className="item mode" title="Current Interaction Mode">
            idle
          </p>
          <p className="button toggle-sel-mode" title="Toggle Selection Mode">
            bbox
          </p>
          <p className="item svg-dom-rect" title="Current View Box">
            937 * 930
          </p>
        </div>
        <div className="right">
          <p className="button reset-zoom" title="Click to Reset Zoom">
            100%
          </p>
        </div>
      </div>
    )
  }
}
