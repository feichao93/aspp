import { Button, ButtonGroup } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import MainState from '../../types/MainState'
import { requestSaveCurrentAnnotationSet } from '../../utils/actionCreators'

export interface EditHistoryGroupProps {
  main: MainState
  dispatch: Dispatch
}

class EditHistoryButtonGroup extends React.Component<EditHistoryGroupProps> {
  render() {
    const { main, dispatch } = this.props

    return (
      <ButtonGroup>
        <Button
          style={{ marginLeft: 16 }}
          icon="cloud-upload"
          text="保存"
          disabled={!main.altered}
          onClick={() => dispatch(requestSaveCurrentAnnotationSet())}
        />
        <Button icon="eraser" disabled />
        <Button icon="undo" disabled />
        <Button icon="redo" disabled />
      </ButtonGroup>
    )
  }
}

export default connect((s: State) => ({ main: s.main }))(EditHistoryButtonGroup)
