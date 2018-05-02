import classNames from 'classnames'
import React from 'react'
import AlgorithmsPanel from './AlgorithmsPanel'
import AnnotationDetailPanel from './AnnotationDetailPanel'
import HistoryPanel from './HistoryPanel'
import './PanelContainer.styl'
import TagsPanel from './TagsPanel'

function ChooserItem({
  activePanel,
  name,
  onChoose,
}: {
  activePanel: string
  name: string
  onChoose: (name: string) => void
}) {
  return (
    <button
      className={classNames('panel-chooser-item', { active: activePanel === name })}
      onClick={() => onChoose(name)}
    >
      {name}
    </button>
  )
}

export default class PanelContainer extends React.Component {
  state = {
    activePanel: 'annotation',
  }

  onChoose = (panelName: string) => {
    this.setState({ activePanel: panelName })
  }

  render() {
    const { activePanel } = this.state

    return (
      <div className="panel-container">
        <div className="panel-chooser">
          <ChooserItem name="annotation" activePanel={activePanel} onChoose={this.onChoose} />
          <ChooserItem name="tags" activePanel={activePanel} onChoose={this.onChoose} />
          <ChooserItem name="algorithms" activePanel={activePanel} onChoose={this.onChoose} />
          <ChooserItem name="history" activePanel={activePanel} onChoose={this.onChoose} />
        </div>
        {activePanel === 'annotation' && <AnnotationDetailPanel />}
        {activePanel === 'tags' && <TagsPanel />}
        {activePanel === 'algorithms' && <AlgorithmsPanel />}
        {activePanel === 'history' && <HistoryPanel />}
      </div>
    )
  }
}
