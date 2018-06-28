import { List } from 'immutable'
import { put, take } from 'little-saga/compat'
import DecorationRange from '../types/DecorationRange'
import FileInfo from '../types/FileInfo'
import Action from '../utils/actions'
import { a } from '../utils/common'
import SelectionUtils from '../utils/SelectionUtils'

export default function* devHelper() {
  if (DEV_HELPER) {
    yield take(a('LOAD_TREE_STATE'))
    yield put(
      Action.reqOpenDocStat(
        new FileInfo({
          docPath: List.of('diff-test'),
          docname: 'test.json',
          collname: 'ASPP_DOC_STAT_NAME',
        }),
      ),
    )
  }
}

if (DEV_HELPER) {
  const injectToolsToGlobal = function(global: any) {
    global.setRange = (blockIndex: number, startOffset: number, endOffset: number) => {
      SelectionUtils.setCurrentRange(new DecorationRange({ startOffset, endOffset, blockIndex }))
    }
    global.getRange = () => {
      const range = SelectionUtils.getCurrentRange()
      return range && range.toJS()
    }
  }

  injectToolsToGlobal(global)
}
