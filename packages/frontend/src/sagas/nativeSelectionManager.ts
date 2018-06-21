import { is } from 'immutable'
import { delay, eventChannel, io } from 'little-saga/compat'
import { State } from '../reducers'
import { setRange } from '../reducers/mainReducer'
import { userClearSel } from '../utils/actionCreators'
import InteractionCollector from '../utils/InteractionCollector'
import SelectionUtils from '../utils/SelectionUtils'

function* autoClearNativeSelectionAfterSetSel() {
  while (true) {
    yield io.take('UPDATE_MAIN')
    const state: State = yield io.select()
    if (!state.main.sel.isEmpty()) {
      SelectionUtils.setCurrentRange(null)
    }
  }
}

function* autoClearSelAndUpdateRange() {
  const collector: InteractionCollector = yield io.getContext('collector')
  const selectionChangeChan = eventChannel<'selection-change'>(emit => {
    const selecttionChangeCallback = () => emit('selection-change')
    document.addEventListener('selectionchange', selecttionChangeCallback)
    return () => document.removeEventListener('selectionchange', selecttionChangeCallback)
  })
  const mouseupChan = eventChannel<'mouseup'>(emit => {
    const mouseupCallback = () => emit('mouseup')
    document.addEventListener('mouseup', mouseupCallback)
    return () => document.removeEventListener('mouseup', mouseupCallback)
  })

  try {
    while (true) {
      yield io.take(selectionChangeChan)
      while (true) {
        const [debouncing, mouseup, timeout] = yield io.race([
          io.take(selectionChangeChan),
          io.take(mouseupChan),
          delay(100),
        ])
        if (mouseup || timeout) {
          const { main }: State = yield io.select()
          const nextRange = SelectionUtils.getCurrentRange()
          // 当用户拖动鼠标选中某一段文本时，自动清空 sel
          if (!main.sel.isEmpty() && nextRange != null) {
            yield io.put(userClearSel('auto'))
          }
          if (!is(main.range, nextRange)) {
            collector.userChangeRange(nextRange)
            yield io.put(setRange(nextRange))
          }
          break
        }
      }
    }
  } finally {
    selectionChangeChan.close()
  }
}

export default function* nativeSelectionManager() {
  yield io.fork(autoClearSelAndUpdateRange)
  yield io.fork(autoClearNativeSelectionAfterSetSel)
}
