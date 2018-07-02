import Action from '../utils/actions'

export interface ConfirmDialogState {
  type: 'confirm'
  message: JSX.Element | string
}

export interface PromptDialogState {
  type: 'prompt'
  message: JSX.Element | string
}

export type DialogState = ConfirmDialogState | PromptDialogState

export default function dialogReducer(state: DialogState = null, action: Action): DialogState {
  if (action.type === 'SHOW_CONFIRM_DIALOG') {
    return { type: 'confirm', message: action.message }
  } else if (action.type === 'SHOW_PROMPT_DIALOG') {
    return { type: 'prompt', message: action.message }
  } else if (action.type === 'HIDE_DIALOG') {
    return null
  } else {
    return state
  }
}
