import { Intent, Toaster } from '@blueprintjs/core'
import Action from '../utils/actions'

const toaster = Toaster.create()

export function handleToast({ message, intent = Intent.PRIMARY }: Action.Toast) {
  toaster.show({ intent, message })
}

export default toaster
