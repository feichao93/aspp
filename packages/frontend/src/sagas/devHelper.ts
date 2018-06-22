import { put, take } from 'little-saga/compat'
import DecorationRange from '../types/DecorationRange'
import { requestOpenDocStat } from '../utils/actionCreators'
import Action from '../utils/actions'
import SelectionUtils from '../utils/SelectionUtils'

export default function* devHelper() {
  if (process.env.NODE_ENV === 'development') {
    const { treeState }: Action.LoadTreeState = yield take('LOAD_DATA')
    const firstDoc = treeState.docs[0]
    // if (firstDoc && firstDoc.annotations.length > 0) {
    //   yield put(requestOpenColl(firstDoc.name, firstDoc.annotations[0]))
    // }
    yield put(requestOpenDocStat(firstDoc.name))
  }
}

if (process.env.NODE_ENV === 'development') {
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
