import { Tab, Tabs } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { State } from '../../reducers'
import DetailPanel from './DetailPanel'
import DiffPanel from './DiffPanel'
import HistoryPanel from './HistoryPanel'
import './PanelContainer.styl'
import TagsPanel from './TagsPanel'
import TaskPanel from './TaskPanel'

class PanelContainer extends React.Component<{ hide: boolean }> {
  state = {
    panelName: 'detail',
  }
  onChange = (panelName: string) => this.setState({ panelName })

  render() {
    const { panelName } = this.state

    return (
      <Tabs
        renderActiveTabPanelOnly
        id="panel-container"
        className={classNames('panel-container', { hide: this.props.hide })}
        selectedTabId={panelName}
        onChange={this.onChange}
      >
        <Tab id="detail" title="详情" panel={<DetailPanel />} />
        <Tab id="diff" title="对比" panel={<DiffPanel />} />
        <Tab id="task" title="任务" panel={<TaskPanel />} />
        <Tab id="tags" title="标签" panel={<TagsPanel />} />
        <Tab id="history" title="操作历史" panel={<HistoryPanel />} />
      </Tabs>
    )
  }
}

export default connect((s: State) => ({ hide: s.config.hidePanels }))(PanelContainer)
