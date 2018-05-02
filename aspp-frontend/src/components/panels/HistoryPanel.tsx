import React from 'react'
import './HistoryPanel.styl'

export default class HistoryPanel extends React.Component {
  render() {
    return (
      <div className="panel history-panel">
        <h2>TODO history panel</h2>
        <div style={{ marginLeft: 8 }}>
          <p>显示了最近用户进行的操作</p>
        </div>
      </div>
    )
  }
}
