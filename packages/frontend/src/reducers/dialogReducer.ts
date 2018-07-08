import { DialogOption } from '../components/dialogs/SelectDialog'
import Action from '../utils/actions'

export interface ConfirmDialogState {
  type: 'confirm'
  message: JSX.Element | string
}
export interface SelectDialogState {
  type: 'select'
  message: JSX.Element | string
  options: DialogOption[]
}
export interface PromptDialogState {
  type: 'prompt'
  message: JSX.Element | string
  defaultValue: string
}

export type DialogState = ConfirmDialogState | PromptDialogState | SelectDialogState

export default function dialogReducer(state: DialogState = null, action: Action): DialogState {
  if (action.type === 'SHOW_CONFIRM_DIALOG') {
    return { type: 'confirm', message: action.message }
  } else if (action.type === 'SHOW_SELECT_DIALOG') {
    return { type: 'select', message: action.message, options: action.options }
  } else if (action.type === 'SHOW_PROMPT_DIALOG') {
    return { type: 'prompt', message: action.message, defaultValue: action.defaultValue }
  } else if (action.type === 'HIDE_DIALOG') {
    return null
  } else {
    return state
  }
}
