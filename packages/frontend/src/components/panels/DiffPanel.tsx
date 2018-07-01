import { Button, NonIdealState } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import Annotation from '../../types/Annotation'
import Decoration from '../../types/Decoration'
import EditorState from '../../types/EditorState'
import Action from '../../utils/actions'
import { Diff } from '../../utils/calculateDiffs'
import { shortenText14 } from '../../utils/common'
import { DIFF_SLOT_COLOR_MAP } from '../AnnotationEditor/calculateStyle'
import Span from '../AnnotationEditor/Span'
import './DiffPanel.styl'

interface DiffDistributionProps {
  diff: Diff
  slotId: string
  editor: EditorState
  dispatch: Dispatch
}

const DiffDistribution = ({ diff, editor, slotId, dispatch }: DiffDistributionProps) => (
  <div className="diff-distribution">
    {diff.distribution.map(([choice, annotations]) => {
      return (
        <div key={choice} className="row">
          <header>
            <Button
              small
              icon="tick-circle"
              minimal
              onClick={() => dispatch(Action.userSettleDiff(slotId, choice))}
            />
            <span>{choice} :</span>
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
                  processText={shortenText14}
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

export interface DiffPanelProps {
  editor: EditorState
  dispatch: Dispatch
}

class DiffPanel extends React.Component<DiffPanelProps> {
  renderContent() {
    const { editor, dispatch } = this.props
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
            processText={shortenText14}
          />
        </div>
        <DiffDistribution dispatch={dispatch} slotId={decoration.id} diff={diff} editor={editor} />
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
