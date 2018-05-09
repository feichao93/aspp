import { Tab, Tabs } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import AlgorithmsPanel from './AlgorithmsPanel'
import DetailPanel from './DetailPanel'
import HistoryPanel from './HistoryPanel'
import './PanelContainer.styl'
import TagsPanel from './TagsPanel'

export default class PanelContainer extends React.Component {
  state = {
    selectedTabId: 'detail',
  }

  onChange = (panelName: string) => {
    this.setState({ selectedTabId: panelName })
  }

  render() {
    const { selectedTabId } = this.state

    return (
      <Tabs
        id="panel-container"
        className={classNames('panel-container')}
        selectedTabId={selectedTabId}
        onChange={this.onChange}
      >
        <Tab id="detail" className="tab-header" title="detail" panel={<DetailPanel />} />
        <Tab
          id="algorithms"
          className="tab-header"
          title="algorithms"
          panel={<AlgorithmsPanel />}
        />
        <Tab id="tags" className="tab-header" title="tags" panel={<TagsPanel />} />
        <Tab id="history" className="tab-header" title="history" panel={<HistoryPanel />} />
      </Tabs>
    )
  }
}
