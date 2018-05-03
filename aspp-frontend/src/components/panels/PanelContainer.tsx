import { Classes, Tab, Tabs } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import AlgorithmsPanel from './AlgorithmsPanel'
import AnnotationDetailPanel from './AnnotationDetailPanel'
import HistoryPanel from './HistoryPanel'
import './PanelContainer.styl'
import TagsPanel from './TagsPanel'

export default class PanelContainer extends React.Component {
  state = {
    selectedTabId: 'annotation',
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
        <Tab
          id="annotation"
          className="tab-header"
          title="annotation"
          panel={<AnnotationDetailPanel />}
        />
        <Tab id="tags" className="tab-header" title="tags" panel={<TagsPanel />} />
        <Tab
          id="algorithms"
          className="tab-header"
          title="algorithms"
          panel={<AlgorithmsPanel />}
        />
        <Tab id="history" className="tab-header" title="history" panel={<HistoryPanel />} />
      </Tabs>
    )
  }
}
