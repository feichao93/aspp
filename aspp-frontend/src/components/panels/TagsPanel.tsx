import React from 'react'
import CONFIG from '../../taskConfig'
import './TagsPanel.styl'

export default class TagsPanel extends React.Component {
  render() {
    return (
      <div className="panel tags-panel">
        <div className="block preview">
          {CONFIG.taskConfig.tags.map(t => (
            <p
              key={t.name}
              className="annotation"
              style={Object.assign({ paddingLeft: 8, fontSize: '16px' }, t.theme)}
            >
              {t.abbr && (
                <span className="tag-abbr" data-skipoffset>
                  {t.abbr + ' '}
                </span>
              )}
              {t.label + ' ' + t.name}
            </p>
          ))}
        </div>
      </div>
    )
  }
}
