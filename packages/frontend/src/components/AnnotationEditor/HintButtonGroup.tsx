import { Button, ButtonGroup } from '@blueprintjs/core'
import { is, Set } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { setSel } from '../../reducers/mainReducer'
import Decoration from '../../types/Decoration'
import MainState from '../../types/MainState'
import { userAcceptCurrent, userDeleteCurrent, userSetSel } from '../../utils/actionCreators'
import { compareArray, isElementVisible } from '../../utils/common'
import './HintButtonGroup.styl'

interface HintButtonGroupProps {
  main: MainState
  dispatch: Dispatch
}

class HintButtonGroup extends React.Component<HintButtonGroupProps> {
  static getSelectedHint({ main }: HintButtonGroupProps) {
    if (main.sel.count() === 1) {
      return main.hints.get(main.sel.first(), null)
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
    const { main, dispatch } = this.props

    const hint = main.hints.get(main.sel.first())
    const hintList = main.hints.toList().sortBy(Decoration.getPosition, compareArray)
    const index = hintList.indexOf(hint)
    let nextHint = hintList.get(index + 1)
    if (nextHint == null) {
      // 没有后继，则尝试返回到 index-0 处
      if (index !== 0) {
        nextHint = hintList.get(0)
      }
    }
    if (nextHint) {
      // TODO 不能直接修改 sel
      dispatch(setSel(Set.of(nextHint.id)))
    }
  }

  onDeny = () => {
    const { dispatch } = this.props
    dispatch(userDeleteCurrent())
    this.selectNextHint()
  }

  onAccept = () => {
    const { dispatch } = this.props
    dispatch(userAcceptCurrent())
    this.selectNextHint()
  }

  render() {
    const { main, dispatch } = this.props

    const hintList = main.hints.toList().sortBy(Decoration.getPosition, compareArray)
    let index = -1
    if (main.sel.count() === 1) {
      const hint = main.hints.get(main.sel.first())
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
            onClick={() => dispatch(userSetSel(Set.of(hintList.get(index - 1).id)))}
          />
          <Button rightIcon="cross" disabled={index === -1} onClick={this.onDeny} />
          <Button rightIcon="tick" disabled={index === -1} onClick={this.onAccept} />
          <Button
            icon="arrow-right"
            disabled={index === hintList.count() - 1}
            onClick={() => dispatch(userSetSel(Set.of(hintList.get(index + 1).id)))}
          />
        </ButtonGroup>
      </div>
    )
  }
}

export default connect((s: State) => ({ main: s.main }))(HintButtonGroup)
