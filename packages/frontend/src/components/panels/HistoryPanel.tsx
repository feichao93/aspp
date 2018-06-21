import { Icon, Position, Tooltip } from '@blueprintjs/core'
import classNames from 'classnames'
import moment from 'moment'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import MainHistory from '../../types/MainHistory'
import Action from '../../utils/actions'
import './HistoryPanel.styl'

export interface HistoryPanelProps {
  history: MainHistory
  dispatch: Dispatch<Action>
}

function ColorDescription() {
  return (
    <Tooltip
      content={
        <div style={{ width: 350 }}>
          绿色表示操作来自任务（例如修复标注的偏移量）。<br />
          橙色表示操作引起了副作用（例如保存标注文件到服务器），该操作记录仅作提示用，撤销/重做该操作不会发生任何事。<br />
          关闭文件或打开新的文件时，操作记录将被清空。
        </div>
      }
      modifiers={{
        preventOverflow: { enabled: false },
        hide: { enabled: false },
      }}
    >
      <div style={{ height: 24, display: 'flex', alignItems: 'center' }}>
        <Icon icon="info-sign" />
        <span style={{ marginLeft: 8 }}>说明</span>
      </div>
    </Tooltip>
  )
}

class HistoryPanel extends React.Component<HistoryPanelProps> {
  render() {
    const { history } = this.props
    return (
      <div className="panel history-panel">
        <ColorDescription />
        {history.list.isEmpty() ? (
          <p>这里将显示最近的操作</p>
        ) : (
          <ul className="action-list">
            {history.list.map((action, index) => (
              <li
                key={index}
                className={classNames('action-item', action.category, {
                  active: index < history.count,
                })}
              >
                <b>
                  {moment(action.time).format('HH:mm:ss')}
                  {' - '}
                </b>
                {action.getMessage()}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
}

export default connect((s: State) => ({ history: s.history }))(HistoryPanel)
