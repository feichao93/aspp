import { Tab, Tabs } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import Action from '../../utils/actions'
import { clamp } from '../../utils/common'
import ConnectionPanel from './ConnectionPanel'
import DetailPanel from './DetailPanel'
import DiffPanel from './DiffPanel'
import HistoryPanel from './HistoryPanel'
import './PanelContainer.styl'
import TagsPanel from './TagsPanel'
import TaskPanel from './TaskPanel'

const SASH_WIDTH = 4
const MINIMUM_WIDTH = 30
const MIN_WIDTH = 320
const INIT_WIDTH = 500
const MAX_WIDTH = 800
const HIDE_THRESHOLD = 100
const SHOW_THRESHOLD = 150

class PanelContainer extends React.Component<{ hide: boolean; dispatch: Dispatch }> {
  isResizing = false
  startX: number
  startWidth: number

  state = {
    panelName: 'connection',
    width: INIT_WIDTH,
  }

  onChange = (panelName: string) => this.setState({ panelName })

  componentDidMount() {
    document.addEventListener('mousemove', this.documentMouseMoveHandler)
    document.addEventListener('mouseup', this.documentMouseUpHandler)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.documentMouseMoveHandler)
    document.removeEventListener('mouseup', this.documentMouseUpHandler)
  }

  onResizeStart = (e: React.MouseEvent) => {
    const { hide } = this.props
    if (hide) {
      this.startWidth = MINIMUM_WIDTH
    } else {
      this.startWidth = this.state.width
    }
    e.preventDefault()
    this.isResizing = true
    this.startX = e.clientX
  }

  documentMouseMoveHandler = (e: MouseEvent) => {
    if (this.isResizing) {
      const movingX = e.clientX
      const width = this.startWidth - movingX + this.startX
      this.setState({ width: clamp(MIN_WIDTH, width, MAX_WIDTH) })
      const { hide, dispatch } = this.props
      if ((width < HIDE_THRESHOLD && !hide) || (width > SHOW_THRESHOLD && hide)) {
        dispatch(Action.togglePanelsVisibility())
      }
    }
  }

  documentMouseUpHandler = () => {
    this.isResizing = false
  }

  render() {
    const { hide } = this.props
    const { panelName, width } = this.state

    if (hide) {
      return (
        <div
          className="panel-container minimum"
          onMouseDown={this.onResizeStart}
          style={{ width: MINIMUM_WIDTH, lineHeight: `${MINIMUM_WIDTH - SASH_WIDTH}px` }}
        >
          面板
        </div>
      )
    }

    return (
      <div className={classNames('panel-container')} style={{ width }}>
        <div className="sash" onMouseDown={this.onResizeStart} />
        <Tabs
          renderActiveTabPanelOnly
          id="panel-container"
          selectedTabId={panelName}
          onChange={this.onChange}
        >
          <Tab id="detail" title="详情" panel={<DetailPanel />} />
          <Tab id="diff" title="对比" panel={<DiffPanel />} />
          <Tab id="task" title="任务" panel={<TaskPanel />} />
          <Tab id="tags" title="标签" panel={<TagsPanel />} />
          <Tab id="history" title="操作历史" panel={<HistoryPanel />} />
          <Tab id="connection" title="连接" panel={<ConnectionPanel />} />
        </Tabs>
      </div>
    )
  }
}

export default connect((s: State) => ({ hide: s.config.hidePanels }))(PanelContainer)
