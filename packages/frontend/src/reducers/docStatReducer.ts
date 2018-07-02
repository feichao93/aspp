import fs from 'fs'
import { List, Record } from 'immutable'
import Action from '../utils/actions'

export interface DocStatItem {
  collname: string
  annotationCount: number
  fileStat: fs.Stats
}

const DocStatRecord = Record({
  docname: '',
  items: List<DocStatItem>(),
})

export class DocStatState extends DocStatRecord {}

export default function docStatReducer(state = new DocStatState(), action: Action) {
  if (action.type === 'UPDATE_DOC_STAT') {
    return action.updater(state)
  } else {
    return state
  }
}

export function updateDocStat(updater: (ds: DocStatState) => DocStatState): Action.UpdateDocStat {
  return { type: 'UPDATE_DOC_STAT', updater }
}

export function setDocStat(ds: DocStatState) {
  return updateDocStat(() => ds)
}
