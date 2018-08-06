import { is } from 'immutable'
import { State } from '../reducers'
import { CacheState } from '../reducers/cacheReducer'

export const hasUnsavedChanges = ({ fileInfo, editor, cache }: State) => {
  return fileInfo.getType() === 'coll' && !is(new CacheState(editor), cache)
}
