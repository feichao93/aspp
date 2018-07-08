import { Button, Classes, Intent } from '@blueprintjs/core'
import React from 'react'
import { Dispatch } from 'redux'
import Action from '../../utils/actions'

export type DialogOption = string | { option: string; intent: Intent }
export interface SelectDialogProps {
  message: JSX.Element | string
  options: DialogOption[]
  dispatch: Dispatch
}
function normalizeDialogOptions(
  options: DialogOption[],
): Array<{ option: string; intent: Intent }> {
  return options.map(
    option => (typeof option === 'string' ? { option, intent: Intent.NONE } : option),
  )
}
export default class SelectDialog extends React.PureComponent<SelectDialogProps> {
  render() {
    const { options, message, dispatch } = this.props

    return (
      <React.Fragment>
        <div className={Classes.DIALOG_BODY}>
          <div style={{ fontSize: '16px' }}>
            <p>{message}</p>
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            {normalizeDialogOptions(options).map((option, index) => (
              <Button
                key={index}
                onClick={() => dispatch(Action.settleSelectDialog(option.option))}
                intent={option.intent}
              >
                {option.option}
              </Button>
            ))}
          </div>
        </div>
      </React.Fragment>
    )
  }
}
