import FileInfo from '../types/FileInfo'
import Action from '../utils/actions'

export default function fileInfoReducer(state = new FileInfo(), action: Action) {
  if (action.type === 'UPDATE_FILE_INFO') {
    return action.updater(state)
  }
  return state
}

export function updateFileInfo(updater: (info: FileInfo) => FileInfo): Action.UpdateFileInfo {
  return { type: 'UPDATE_FILE_INFO', updater }
}

export function setFileInfo(fileInfo: FileInfo) {
  return updateFileInfo(() => fileInfo)
}
