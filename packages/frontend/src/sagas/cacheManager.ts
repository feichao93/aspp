import { io } from 'little-saga'
import { State } from '../reducers'
import { CacheState } from '../reducers/cacheReducer'
import Action from '../utils/actions'

export function* updateCacheSaga() {
  const { editor }: State = yield io.select()
  yield io.put(Action.updateCache(() => new CacheState(editor)))
}

export function* invalidateCacheSaga() {
  yield io.put(Action.updateCache(() => new CacheState()))
}
