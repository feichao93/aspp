import FileInfo from '../types/FileInfo'
import Action from '../utils/actions'

export interface ClientsState {
  [key: string]: {
    clientId: number
    username: string
    editingColl: FileInfo
    // TODO 目前 online 总是为 true
    online: boolean
  }
}

export default function clientsReducers(state = {}, action: Action) {
  if (action.type === 'UPDATE_CLIENTS_INFO') {
    return action.clients
  } else {
    return state
  }
}
