import { is } from 'immutable'
import { eventChannel, io } from 'little-saga/compat'
import { State } from '../reducers'
import { setRange } from '../reducers/mainReducer'
import { userClearSel } from '../utils/actionCreators'
import InteractionCollector from '../utils/InteractionCollector'
import schedulers from '../utils/schedulers'
import SelectionUtils from '../utils/SelectionUtils'

/** 用户只能通过改变 native-selection 才能更新 `main.range`
 * 该 saga 监听浏览器 selectionchange 事件，自动将 native-selection 的更新映射到 `main.range`
 * 更新 `main.range` 的一个例外是：当用户切换到一个非空的 `sel` 时，`main.range` 将自动设置为空
 * `AnnotationEditor#componentDidUpdate` 用于处理此例外情况
 * */
function* autoClearSelAndUpdateRange() {
  const collector: InteractionCollector = yield io.getContext('collector')
  const chan = eventChannel<'selection-change'>(emit => {
    const callback = () => schedulers.batch(emit, 'selection-change')
    document.addEventListener('selectionchange', callback)
    return () => document.removeEventListener('selectionchange', callback)
  })

  try {
    while (true) {
      yield io.take(chan)
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
    }
  } finally {
    chan.close()
  }
}

export default function* nativeSelectionManager() {
  yield io.fork(autoClearSelAndUpdateRange)
}
