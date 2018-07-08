import { Dialog } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { DialogState } from '../../reducers/dialogReducer'
import Action from '../../utils/actions'
import ConfirmDialogContent from './ConfirmDialogContent'
import PromptDialogContent from './PromptDialogContent'
import SelectDialog from './SelectDialog'

const DIALOG_TITLE_MAP = {
  prompt: '输入',
  confirm: '确认',
  select: '选择',
}

class DialogContainer extends React.Component<{ dialog: DialogState; dispatch: Dispatch }> {
  renderConfirmDialog() {
    const { dialog } = this.props
    if (dialog && dialog.type === 'confirm') {
      return (
        <ConfirmDialogContent
          message={dialog.message}
          onConfirm={() => this.props.dispatch(Action.settleConfirmDialog(true))}
          onCancel={() => this.props.dispatch(Action.settleConfirmDialog(false))}
        />
      )
    }
    return null
  }

  renderPromptDialog() {
    const { dialog } = this.props
    if (dialog && dialog.type === 'prompt') {
      return (
        <PromptDialogContent
          message={dialog.message}
          defaultValue={dialog.defaultValue}
          onConfirm={value => this.props.dispatch(Action.settlePromptDialog(value))}
        />
      )
    } else {
      return null
    }
  }
  renderSelectDialog() {
    const { dialog, dispatch } = this.props
    if (dialog && dialog.type === 'select') {
      return <SelectDialog message={dialog.message} options={dialog.options} dispatch={dispatch} />
    } else {
      return null
    }
  }

  render() {
    const { dialog } = this.props
    return (
      <Dialog
        icon="info-sign"
        title={(dialog && DIALOG_TITLE_MAP[dialog.type]) || '信息'}
        isOpen={Boolean(dialog)}
        style={{ width: 600, alignSelf: 'flex-start' }}
        isCloseButtonShown={false}
      >
        {this.renderConfirmDialog()}
        {this.renderPromptDialog()}
        {this.renderSelectDialog()}
      </Dialog>
    )
  }
}

export default connect((s: State) => ({ dialog: s.dialog }))(DialogContainer)
