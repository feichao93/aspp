import { Button, ButtonGroup } from '@blueprintjs/core'
import { is, Set } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import EditorState from '../../types/EditorState'
import Action from '../../utils/actions'
import { compareDecorationPosArray, isElementVisible } from '../../utils/common'
import './HintButtonGroup.styl'

interface HintButtonGroupProps {
  editor: EditorState
  dispatch: Dispatch
}

class HintButtonGroup extends React.Component<HintButtonGroupProps> {
  static getSelectedHint({ editor }: HintButtonGroupProps) {
    if (editor.sel.count() === 1) {
      return editor.hints.get(editor.sel.first(), null)
    } else {
      return null
    }
  }

  componentDidUpdate(prevProps: HintButtonGroupProps) {
    const oldHint = HintButtonGroup.getSelectedHint(prevProps)
    const hint = HintButtonGroup.getSelectedHint(this.props)
    if (hint && !is(oldHint, hint)) {
      const hintElement = document.querySelector(`*[data-id="${hint.id}"]`)
      if (!isElementVisible(hintElement)) {
        hintElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  selectNextHint() {
    const { editor, dispatch } = this.props

    const hint = editor.hints.get(editor.sel.first())
    const hintList = editor.hints.toList().sort(compareDecorationPosArray)
    const index = hintList.indexOf(hint)
    let nextHint = hintList.get(index + 1)
    if (nextHint == null) {
      // 没有后继，则尝试返回到 index-0 处
      if (index !== 0) {
        nextHint = hintList.get(0)
      }
    }
    if (nextHint) {
      dispatch(Action.userSetSel(Set.of(nextHint.id)))
    }
  }

  onDeny = () => {
    const { dispatch } = this.props
    dispatch(Action.userDeleteCurrent())
    this.selectNextHint()
  }

  onAccept = () => {
    const { dispatch } = this.props
    dispatch(Action.userAcceptCurrent())
    this.selectNextHint()
  }

  render() {
    const { editor, dispatch } = this.props

    const hintList = editor.hints.toList().sort(compareDecorationPosArray)
    let index = -1
    if (editor.sel.count() === 1) {
      const hint = editor.hints.get(editor.sel.first())
      if (hint != null) {
        index = hintList.indexOf(hint)
      }
    }

    return (
      <div className="hint-button-group">
        <div className="counter">
          {hintList.isEmpty() ? (
            'no hints'
          ) : (
            <React.Fragment>
              hints: {index === -1 ? '?' : index + 1} / {hintList.count()}
            </React.Fragment>
          )}
        </div>
        <ButtonGroup>
          <Button
            icon="arrow-left"
            disabled={index === -1 || index === 0}
            onClick={() => dispatch(Action.userSetSel(Set.of(hintList.get(index - 1).id)))}
          />
          <Button rightIcon="cross" disabled={index === -1} onClick={this.onDeny} />
          <Button rightIcon="tick" disabled={index === -1} onClick={this.onAccept} />
          <Button
            icon="arrow-right"
            disabled={index === hintList.count() - 1}
            onClick={() => dispatch(Action.userSetSel(Set.of(hintList.get(index + 1).id)))}
          />
        </ButtonGroup>
      </div>
    )
  }
}

export default connect((s: State) => ({ editor: s.editor }))(HintButtonGroup)
