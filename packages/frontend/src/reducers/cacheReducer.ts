import { Map, Record } from 'immutable'
import Annotation from '../types/Annotation'
import { Slot } from '../types/Decoration'
import Action from '../utils/actions'

const CacheStateRecord = Record({
  annotations: Map<string, Annotation>(),
  slots: Map<string, Slot>(),
})

export class CacheState extends CacheStateRecord {}

export default function cacheReducer(state = new CacheState(), action: Action) {
  if (action.type === 'UPDATE_CACHE') {
    return action.updater(state)
  } else {
    return state
  }
}
