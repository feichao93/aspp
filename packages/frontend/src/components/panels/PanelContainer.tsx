import { Tab, Tabs } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import { RouteComponentProps } from 'react-router'
import { withRouter } from 'react-router-dom'
import history from '../../utils/history'
import DetailPanel from './DetailPanel'
import HistoryPanel from './HistoryPanel'
import './PanelContainer.styl'
import TagsPanel from './TagsPanel'
import TaskPanel from './TaskPanel'

@(withRouter as any)
export default class PanelContainer extends React.Component<Partial<RouteComponentProps<null>>> {
  onChange = (panelName: string) => {
    const params = new URLSearchParams(location.search)
    params.set('panel', panelName)
    history.push({ search: params.toString() })
  }

  render() {
    const { location } = this.props
    const panel = new URLSearchParams(location.search).get('panel') || 'detail'

    return (
      <Tabs
        renderActiveTabPanelOnly
        id="panel-container"
        className={classNames('panel-container')}
        selectedTabId={panel}
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
