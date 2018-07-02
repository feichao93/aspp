import { Button, Classes, Intent, Label } from '@blueprintjs/core'
import React from 'react'
import { autoFocus } from '../../utils/common'

export interface PromptDialogContentProps {
  message: JSX.Element | string
  onConfirm(result: string): void
}

export default class PromptDialogContent extends React.Component<PromptDialogContentProps> {
  state = {
    value: '',
  }

  render() {
    const { onConfirm, message } = this.props
    const { value } = this.state

    return (
      <React.Fragment>
        <div className={Classes.DIALOG_BODY}>
          <div style={{ fontSize: '16px' }}>
            <Label text={message} inline>
              <input
                type="text"
                className={Classes.INPUT}
                value={value}
                style={{ width: '60%' }}
                ref={autoFocus}
                onChange={e => this.setState({ value: e.target.value })}
              />
            </Label>
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => onConfirm(value)} intent={Intent.PRIMARY}>
              确认
            </Button>
            <Button onClick={() => onConfirm(null)}>取消</Button>
          </div>
        </div>
      </React.Fragment>
    )
  }
}
