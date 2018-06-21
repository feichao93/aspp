import { Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import { delay, io, MulticastChannel } from 'little-saga/compat'
import Annotate from '../actions/Annotate'
import { ActionCategory } from '../actions/MainAction'
import ASPP_CONFIG from '../aspp-config'
import { State } from '../reducers'
import { applyMainAction } from '../sagas/historyManager'
import Annotation from '../types/Annotation'
import DecorationRange from '../types/DecorationRange'
import { toast } from '../utils/actionCreators'
import { keyed } from '../utils/common'
import { Interaction } from '../utils/InteractionCollector'

const HAS_ONLY_ONE_TAG = ASPP_CONFIG.defaultGroup.count() === 1 && ASPP_CONFIG.otherGroups.isEmpty()

const DEFAULT_TAG = ASPP_CONFIG.defaultGroup.first().name

export default class AutoAnnotate {
  static defaultTaskName = 'auto-annotate'
  static disabled = !HAS_ONLY_ONE_TAG
  static description =
    'auto-annotate 如果当前标注工程中只有一种标签，那么启动该任务之后会自动给选中文本打默认标签';

  *saga(chan: MulticastChannel<Interaction>) {
    while (true) {
      let action
      action = yield io.take(chan, 'USER_CHANGE_RANGE')
      while (true) {
        const [timeout, nextAction] = yield io.race([
          delay(250),
          io.take(chan, 'USER_CHANGE_RANGE'),
        ])
        if (timeout) {
          yield io.fork(autoTag, action)
          break
        } else {
          action = nextAction
        }
      }
    }
  }
}

function* autoTag({ range }: Interaction.UserChangeRange) {
  if (range != null) {
    const { main }: State = yield io.select()
    const gathered = main.gather()
    const annotating = Set.of(
      Annotation.annotateRange(DEFAULT_TAG, main.blocks.get(range.blockIndex), range),
    )
    const overlapped = annotating.some(dec1 =>
      gathered.some(dec2 => DecorationRange.isOverlapped(dec1.range, dec2.range)),
    )
    if (overlapped) {
      yield io.put(toast('Overlap', Intent.WARNING))
      return
    }
    yield applyMainAction(
      new Annotate(keyed(annotating), DEFAULT_TAG, 'auto-annotate').withCategory(
        ActionCategory.task,
      ),
    )
  }
}
