import { io } from 'little-saga'
import { State } from '../reducers'
import { CacheState } from '../reducers/cacheReducer'
import Action from '../utils/actions'

/** 使用当前 editor 数据更新缓存 */
export function* updateCacheSaga() {
  const { editor }: State = yield io.select()
  yield io.put(Action.updateCache(() => new CacheState(editor)))
}

/** 清空缓存 */
export function* invalidateCacheSaga() {
  yield io.put(Action.updateCache(() => new CacheState()))
}
