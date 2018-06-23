import FileInfo from '../types/FileInfo'
import Action from '../utils/actions'

export default function openInfoReducer(state = new FileInfo(), action: Action) {
  return state
}

export function updateOpenInfo(updater: (info: FileInfo) => FileInfo) {
  return { type: 'UPDATE_OPEN_INFO', updater }
}
