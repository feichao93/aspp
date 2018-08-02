import { is, List, merge, Seq } from 'immutable'
import { io, MulticastChannel } from 'little-saga'
import React from 'react'
import AddHints from '../actions/AddHints'
import { ActionCategory } from '../actions/EditorAction'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import { applyEditorAction } from '../sagas/historyManager'
import Annotation from '../types/Annotation'
import DecorationRange from '../types/DecorationRange'
import EditorState from '../types/EditorState'
import { Hint } from '../types/Hint'
import { getNextId, keyed } from '../utils/common'
import { Interaction } from '../utils/InteractionCollector'

/** 找到一个 block 中 text 出现的所有位置 */
function findRanges(block: string, blockIndex: number, text: string) {
  const result: DecorationRange[] = []
  if (text.length === 0) {
    return result
  }
  let i = 0
  while (true) {
    const nextIndex = block.indexOf(text, i)
    if (nextIndex === -1) {
      break
    }
    result.push(
      new DecorationRange({
        blockIndex,
        startOffset: nextIndex,
        endOffset: nextIndex + text.length,
      }),
    )
    i = nextIndex + text.length
  }
  return result
}

/** 获取根据 targetText/targetTag 转换已有的 hint 对象 */
function getConvertedHints(editor: EditorState, targetText: string, targetTag: string) {
  const result: Hint[] = []
  editor.hints.filter(hint => {
    const t = hint.range.substring(editor.blocks.get(hint.range.blockIndex))
    if (t === targetText && hint.hintAction.type === 'hint-add-annotations') {
      const newHint = hint.set('message', `Apply ${targetTag}`).set('hintAction', {
        type: 'hint-add-annotations',
        annotation: hint.hintAction.annotation.set('tag', targetTag),
      })
      result.push(newHint)
    }
  })
  return List(result)
}

/** 获取根据 targetText/targetTag 创建的 hint 对象 */
function getCreatedHints(
  editor: EditorState,
  targetText: string,
  targetTag: string,
  currentRange: DecorationRange,
) {
  const ranges = Seq(editor.blocks)
    .flatMap((block, blockIndex) => findRanges(block, blockIndex, targetText))
    // 避开当前位置
    .filterNot(r => is(r, currentRange.normalize()))
    // 避开已经存在标注的位置
    .filterNot(r =>
      editor.annotations.some(annotation => DecorationRange.isIntersected(r, annotation.range)),
    )

  return ranges
    .map(range => {
      const annotation = Annotation.annotateRange(
        targetTag,
        editor.blocks.get(range.blockIndex),
        range,
      )
      return new Hint({
        range,
        id: getNextId('hint'),
        message: `Apply ${targetTag}`,
        hintAction: { type: 'hint-add-annotations', annotation },
      })
    })
    .toList()
}

function handleUserAnnotateSel(editor: EditorState, interaction: Interaction.UserAnnotateSel) {
  return interaction.selection
    .map(decoration => decoration.range.substring(editor.blocks.get(decoration.range.blockIndex)))
    .toSet()
    .flatMap(text => getConvertedHints(editor, text, interaction.tag))
    .toList()
}

function handleUserAnnotateText(editor: EditorState, { range, tag }: Interaction.UserAnnotateText) {
  console.assert(range != null)
  const text = range.substring(editor.blocks.get(range.blockIndex))

  return merge(getConvertedHints(editor, text, tag), getCreatedHints(editor, text, tag, range))
}

function getHints(
  editor: EditorState,
  interaction: Interaction.UserAnnotateText | Interaction.UserAnnotateSel,
) {
  if (interaction.type === 'USER_ANNOTATE_SEL') {
    return handleUserAnnotateSel(editor, interaction)
  } else {
    return handleUserAnnotateText(editor, interaction)
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
      const interaction = yield io.take(chan, ['USER_ANNOTATE_TEXT', 'USER_ANNOTATE_SEL'])
      const { editor }: State = yield io.select()
      const hints = getHints(editor, interaction)
      if (!hints.isEmpty()) {
        yield applyEditorAction(
          new AddHints(
            keyed(hints),
            <span>simple-matching 添加/修改 {Rich.number(hints.count())} 个提示</span>,
          ).withCategory(ActionCategory.task),
        )
      }
    }
  }
}
