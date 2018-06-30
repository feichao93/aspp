import { Button, NonIdealState } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import Annotation from '../../types/Annotation'
import Decoration from '../../types/Decoration'
import EditorState from '../../types/EditorState'
import { Diff } from '../../utils/calculateDiffs'
import { DIFF_SLOT_COLOR_MAP } from '../AnnotationEditor/calculateStyle'
import Span from '../AnnotationEditor/Span'
import './DiffPanel.styl'

export interface DiffPanelProps {
  editor: EditorState
  dispatch: Dispatch
}

interface DiffDistributionProps {
  diff: Diff
  editor: EditorState
}

const DiffDistribution = ({ diff, editor }: DiffDistributionProps) => (
  <div className="diff-distribution">
    {diff.distribution.map(([collname, annotations]) => {
      return (
        <div key={collname} className="row">
          <header>
            {/* TODO last edit here */}
            <Button small icon="tick-circle" minimal />
            <span>{collname} :</span>
          </header>
          {annotations.length > 0 ? (
            <main className="block preview">
              {annotations.map(annotation => (
                <Span
                  key={annotation.id}
                  block={editor.blocks.get(diff.range.blockIndex)}
                  info={{
                    height: 0,
                    decoration: Annotation.fromJS(annotation),
                    children: [],
                  }}
                  shortenLongText
                />
              ))}
            </main>
          ) : (
            <span style={{ color: '#666', marginLeft: 8 }}>{'<空>'}</span>
          )}
        </div>
      )
    })}
  </div>
)

const DiffPartTitle = ({ diff }: { diff: Diff }) => {
  let partTitle = diff.type
  if (diff.type === 'partial') {
    partTitle += ' '
    const hitCount = diff.distribution.filter(([collname, annotations]) => annotations.length > 0)
      .length
    const totalCount = diff.distribution.length
    partTitle += hitCount + '/' + totalCount
  }

  return (
    <h2
      className="part-title"
      style={{
        margin: '0 -8px 10px -8px',
        paddingLeft: 16,
        background: DIFF_SLOT_COLOR_MAP[diff.type],
      }}
    >
      {partTitle}
    </h2>
  )
}

const DiffNonIdealState = () => (
  <NonIdealState
    className="diff-non-ideal-state"
    visual="folder-open"
    title="请恰好选择一个 diff 对象"
  />
)

class DiffPanel extends React.Component<DiffPanelProps> {
  renderContent() {
    const { editor } = this.props
    if (editor.sel.size !== 1) {
      return <DiffNonIdealState />
    }

    const decoration = editor.gather().get(editor.sel.first())
    if (decoration == null || !Decoration.isSlot(decoration) || decoration.slotType !== 'diff') {
      return <DiffNonIdealState />
    }

    const diff: Diff = decoration.data

    return (
      <React.Fragment>
        <DiffPartTitle diff={diff} />
        <div className="block preview">
          <Span
            block={editor.blocks.get(decoration.range.blockIndex)}
            info={{ height: 0, decoration, children: [] }}
            shortenLongText
          />
        </div>
        <DiffDistribution diff={diff} editor={editor} />
      </React.Fragment>
    )
  }

  render() {
    return <div className="panel diff-panel">{this.renderContent()}</div>
  }
}

function mapStateToProps(state: State) {
  return {
    editor: state.editor,
  }
}

export default connect(mapStateToProps)(DiffPanel)
