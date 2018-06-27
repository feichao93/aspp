import { Tab, Tabs } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { State } from '../../reducers'
import DetailPanel from './DetailPanel'
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
        <Tab id="detail" className="tab-header" title="detail" panel={<DetailPanel />} />
        <Tab id="task" className="tab-header" title="task" panel={<TaskPanel />} />
        <Tab id="tags" className="tab-header" title="tags" panel={<TagsPanel />} />
        <Tab id="history" className="tab-header" title="history" panel={<HistoryPanel />} />
      </Tabs>
    )
  }
}

export default connect((s: State) => ({ hide: s.config.hidePanels }))(PanelContainer)
