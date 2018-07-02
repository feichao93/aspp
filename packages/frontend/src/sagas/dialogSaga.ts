import { io } from 'little-saga'
import Action from '../utils/actions'
import { a } from '../utils/common'

export function* confirmDialogSaga(message: string | JSX.Element) {
  try {
    yield io.put(Action.showConfirmDialog(message))
    const action: Action.SettleConfirmDialog = yield io.take(a('SETTLE_CONFIRM_DIALOG'))
    return action.result
  } finally {
    yield io.put(Action.hideDialog())
  }
}

export function* promptDialogSaga(message: string | JSX.Element) {
  try {
    yield io.put(Action.showPromptDialog(message))
    const action: Action.SettlePromptDialog = yield io.take(a('SETTLE_PROMPT_DIALOG'))
    return action.value
  } finally {
    yield io.put(Action.hideDialog())
  }
}
