import { io } from 'little-saga'
import { DialogOption } from '../components/dialogs/SelectDialog'
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
export function* selectDialogSaga(message: string | JSX.Element, options: DialogOption[]) {
  try {
    yield io.put(Action.showSelectDialog(message, options))
    const action: Action.SettleSelectDialog = yield io.take(a('SETTLE_SELECT_DIALOG'))
    return action.selected
  } finally {
    yield io.put(Action.hideDialog())
  }
}

export function* promptDialogSaga(message: string | JSX.Element, defaultValue = '') {
  try {
    yield io.put(Action.showPromptDialog(message, defaultValue))
    const action: Action.SettlePromptDialog = yield io.take(a('SETTLE_PROMPT_DIALOG'))
    return action.value
  } finally {
    yield io.put(Action.hideDialog())
  }
}
