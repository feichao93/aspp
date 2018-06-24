import { Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import { delay, io, MulticastChannel } from 'little-saga/compat'
import Annotate from '../actions/Annotate'
import { ActionCategory } from '../actions/EditorAction'
import ASPP_CONFIG from '../aspp-config'
import { State } from '../reducers'
import { applyEditorAction } from '../sagas/historyManager'
import Annotation from '../types/Annotation'
import DecorationRange from '../types/DecorationRange'
import Action from '../utils/actions'
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
    const { editor }: State = yield io.select()
    const gathered = editor.gather()
    const annotating = Set.of(
      Annotation.annotateRange(DEFAULT_TAG, editor.blocks.get(range.blockIndex), range),
    )
    const overlapped = annotating.some(dec1 =>
      gathered.some(dec2 => DecorationRange.isOverlapped(dec1.range, dec2.range)),
    )
    if (overlapped) {
      yield io.put(Action.toast('Overlap', Intent.WARNING))
      return
    }
    yield applyEditorAction(
      new Annotate(keyed(annotating), DEFAULT_TAG, 'auto-annotate').withCategory(
        ActionCategory.task,
      ),
    )
  }
}
