import { Button, Classes, Intent } from '@blueprintjs/core'
import React from 'react'

export interface ConfirmDialogContentProps {
  message: JSX.Element | string
  onConfirm(): void
  onCancel(): void
}

export default class ConfirmDialogContent extends React.PureComponent<ConfirmDialogContentProps> {
  render() {
    const { onConfirm, onCancel, message } = this.props

    return (
      <React.Fragment>
        <div className={Classes.DIALOG_BODY}>
          <div style={{ fontSize: '16px', lineHeight: 1.5 }}>{message}</div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onConfirm} intent={Intent.PRIMARY}>
              确认
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </div>
        </div>
      </React.Fragment>
    )
  }
}
