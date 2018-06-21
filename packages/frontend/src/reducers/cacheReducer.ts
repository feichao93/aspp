import { Map, Record } from 'immutable'
import Annotation from '../types/Annotation'
import Action from '../utils/actions'

const CacheStateRecord = Record({
  annotations: Map<string, Annotation>(),
})

export class CacheState extends CacheStateRecord {}

export default function cacheReducer(state = new CacheState(), action: Action) {
  if (action.type === 'UPDATE_CACHE') {
    return action.updater(state)
  } else {
    return state
  }
}

function updateCache(updater: (cache: CacheState) => CacheState): Action.UpdateCache {
  return { type: 'UPDATE_CACHE', updater }
}

export function setCachedAnnotations(annotations: Map<string, Annotation>) {
  return updateCache(cache => cache.set('annotations', annotations))
}
