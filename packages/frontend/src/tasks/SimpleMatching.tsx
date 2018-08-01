import { is, List, Seq } from 'immutable'
import { io, MulticastChannel } from 'little-saga'
import React from 'react'
import AddHints from '../actions/AddHints'
import { ActionCategory } from '../actions/EditorAction'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import { addAnnotations } from '../reducers/editorReducer'
import { applyEditorAction } from '../sagas/historyManager'
import Annotation from '../types/Annotation'
import { Hint } from '../types/Decoration'
import { getNextId, keyed } from '../utils/common'
import findMatch from '../utils/findMatch'
import { Interaction } from '../utils/InteractionCollector'

function* handleUserAnnotateText({ range, tag }: Interaction.UserAnnotateText) {
  console.assert(range != null)
  const { editor }: State = yield io.select()
  const text = range.substring(editor.blocks.get(range.blockIndex))
  const gathered = editor.gather()
  const existingRangeSet = gathered.map(decoration => decoration.range.normalize()).toSet()

  const hints = Seq(editor.blocks)
    .flatMap((block, blockIndex) => findMatch(block, blockIndex, gathered, text))
    .filterNot(r => is(r, range.normalize()))
    .filterNot(r => existingRangeSet.has(r.normalize()))
    .map(
      range =>
        new Hint({
          range,
          id: getNextId('hint'),
          hint: `Apply ${tag}`,
          action: addAnnotations(
            keyed(
              List.of(Annotation.annotateRange(tag, editor.blocks.get(range.blockIndex), range)),
            ),
          ),
        }),
    )

  if (!hints.isEmpty()) {
    yield applyEditorAction(
      new AddHints(
        keyed(hints),
        <span>simple-matching 添加 {Rich.number(hints.count())} 个提示</span>,
      ).withCategory(ActionCategory.task),
    )
  }
}

export default class SimpleMatching {
  static singleton = true
  static defaultTaskName = 'simple-matching'
  static description =
    'simple-matching 是一种基础的匹配方法。开启该算法之后，每当用户对某一段文本进行标注时，算法会寻找相同的文本并给出对应的提示'

  constructor(readonly config: any) {}

  *saga(chan: MulticastChannel<Interaction>) {
    while (true) {
      const interaction: Interaction.UserAnnotateText = yield io.take(chan, 'USER_ANNOTATE_TEXT')
      yield handleUserAnnotateText(interaction)
    }
  }
}
