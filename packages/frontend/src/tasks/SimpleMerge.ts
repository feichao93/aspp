import { Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import { io } from 'little-saga'
import { ActionCategory } from '../actions/EditorAction'
import SetSel, { SetSelMethod } from '../actions/SetSel'
import { State } from '../reducers'
import { loadTreeState } from '../sagas/fileSaga'
import { applyEditorAction } from '../sagas/historyManager'
import { RawAnnotation } from '../types/Annotation'
import { RawSlot } from '../types/Decoration'
import EditorState from '../types/EditorState'
import FileInfo from '../types/FileInfo'
import Action from '../utils/actions'
import { Diff } from '../utils/calculateDiffs'
import server, { RawColl } from '../utils/server'
import { Task } from './index'

export interface SimpleMergeOptions {
  minPartialRatio: number
}

class MergeErorr extends Error {
  constructor(readonly slotId: string, readonly diff: Diff) {
    super('Merge error')
  }
}

function resolveConsistentAnnotation(slotId: string, diff: Diff, minRatio: number) {
  let result: RawAnnotation
  let count = 0
  for (const [collname, annotations] of diff.distribution) {
    if (annotations.length > 0) {
      result = annotations[0]
      count++
    }
  }
  if (count >= minRatio * diff.distribution.length) {
    return result
  } else {
    throw new MergeErorr(slotId, diff)
  }
}

function getMergeCollname(fileInfo: FileInfo) {
  const replaced = fileInfo.collname.replace('diff', 'merge')
  if (replaced.startsWith('merge')) {
    return replaced
  } else {
    return 'merge' + replaced
  }
}

function doMerge(resultColl: RawColl, editor: EditorState, options: SimpleMergeOptions) {
  const otherSlots: RawSlot[] = []

  for (const slot of editor.slots.values()) {
    if (slot.slotType === 'diff') {
      const diff: Diff = slot.data
      if (diff.type === 'consistent' || diff.type === 'partial') {
        resultColl.annotations.push(
          resolveConsistentAnnotation(slot.id, diff, options.minPartialRatio),
        )
      } else {
        throw new MergeErorr(slot.id, diff)
      }
    } else {
      otherSlots.push(slot.update('range', range => range.normalize()))
    }
  }

  let nextAnnotationId = 1
  resultColl.annotations.forEach(annotation => {
    annotation.id = `annotation-${nextAnnotationId++}`
  })

  resultColl.slots = otherSlots
}

export default class SimpleMerge {
  static defaultTaskName = 'simple-merge'
  static description =
    'simple-merge 简单的合并算法，根据当前的 diff 数据自动生成对应的标注对象。一致的 diff 将直接生成对应标注对象，部分缺失的 diff 将根据任务配置决定是否生成标注对象，冲突的 diff 无法进行合并。当任务遇到无法处理的 diff 时，任务会选中需要处理的 diff，然后中断执行。'

  static defaultOptions: SimpleMergeOptions = {
    minPartialRatio: 0.5,
  }
  // TODO form

  options: SimpleMergeOptions

  constructor(readonly task: Task) {
    this.options = task.options
  }

  *saga() {
    const { editor, fileInfo }: State = yield io.select()

    try {
      const mergeCollname = getMergeCollname(fileInfo)
      const mergeFileInfo = fileInfo.set('collname', mergeCollname)
      const mergeColl = editor.toRawColl(mergeCollname)
      doMerge(mergeColl, editor, this.options)

      yield server.putColl(mergeFileInfo, mergeColl)
      yield loadTreeState(false)
      yield io.put(Action.toast(`已生成 ${mergeFileInfo.collname}`))
    } catch (e) {
      if (e instanceof MergeErorr) {
        const editorAction = new SetSel(Set.of(e.slotId), SetSelMethod.select)
        yield applyEditorAction(editorAction.withCategory(ActionCategory.task))
        yield io.put(Action.toast('无法完成合并。已选中需要处理的标注，请手动处理', Intent.WARNING))
      } else {
        throw e
      }
    }
  }
}
