import { Button, Classes, Intent, Label, Slider } from '@blueprintjs/core'
import { Set } from 'immutable'
import { io } from 'little-saga'
import React from 'react'
import { ActionCategory } from '../actions/EditorAction'
import SetSel, { SetSelMethod } from '../actions/SetSel'
import { State } from '../reducers'
import { promptDialogSaga } from '../sagas/dialogSaga'
import { loadTreeState, reqCloseCurrentColl } from '../sagas/fileSaga'
import { applyEditorAction } from '../sagas/historyManager'
import toaster from '../sagas/toaster'
import { RawAnnotation } from '../types/Annotation'
import { RawSlot } from '../types/Decoration'
import EditorState from '../types/EditorState'
import FileInfo from '../types/FileInfo'
import Action from '../utils/actions'
import { Diff } from '../utils/calculateDiffs'
import server, { RawColl } from '../utils/server'
import { Task } from './index'
import TaskConstructor from './TaskConstructor'

export interface SimpleMergeOptions {
  minRatio: number
}

interface ConfigFormProps {
  impl: TaskConstructor
  name: string
  options: SimpleMergeOptions
  onChangeName(nextName: string): void
  onChangeOptions(nextOptions: SimpleMergeOptions): void
  onClose(): void
}

type ConfigFormState = SimpleMergeOptions & { editingName: string }

class ConfigForm extends React.Component<ConfigFormProps, ConfigFormState> {
  constructor(props: ConfigFormProps) {
    super(props)
    this.state = {
      ...props.options,
      editingName: props.name,
    }
  }

  resetTaskName = () => {
    this.setState({
      editingName: this.props.impl.defaultTaskName,
    })
  }

  onConfirm = () => {
    const { onClose, onChangeOptions, onChangeName } = this.props
    const { editingName, ...nextOptions } = this.state
    if (name !== editingName) {
      onChangeName(editingName)
    }
    onChangeOptions(nextOptions)
    onClose()
  }

  onEditName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ editingName: e.target.value })
  }

  render() {
    const { name, onClose } = this.props
    const { editingName, minRatio } = this.state

    return (
      <div>
        <div className={Classes.DIALOG_HEADER}>配置 {name}</div>
        <div className={Classes.DIALOG_BODY}>
          <Label text="任务名称" inline>
            <input
              value={editingName}
              className={Classes.INPUT}
              style={{ width: '60%' }}
              onChange={this.onEditName}
            />
            <Button icon="undo" style={{ marginLeft: 16 }} onClick={this.resetTaskName} />
          </Label>
          <Label text="合并 partial 的最小比例" inline>
            <div style={{ width: '90%', marginLeft: '5%' }}>
              <Slider
                value={minRatio}
                min={0}
                max={1}
                stepSize={0.01}
                onChange={minRatio => this.setState({ minRatio })}
              />
            </div>
          </Label>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={this.onConfirm} intent={Intent.PRIMARY}>
              确认
            </Button>
            <Button onClick={onClose}>取消</Button>
          </div>
        </div>
      </div>
    )
  }
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

function getDefaultMergeCollname(fileInfo: FileInfo) {
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
        resultColl.annotations.push(resolveConsistentAnnotation(slot.id, diff, options.minRatio))
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

function* showMergeCollCreatedToast(mergeFileInfo: FileInfo) {
  const shouldOpenMergeColl = yield io.cps((cb: any) =>
    toaster.show({
      intent: Intent.SUCCESS,
      message: `已生成 ${mergeFileInfo.collname}`,
      onDismiss: () => cb(null, false),
      action: {
        icon: 'document-open',
        text: '打开',
        onClick: () => cb(null, true),
      },
    }),
  )
  if (shouldOpenMergeColl) {
    yield reqCloseCurrentColl()
    yield io.put(Action.reqOpenColl(mergeFileInfo))
  }
}

export default class SimpleMerge {
  static implName = 'SimpleMerge'
  static defaultTaskName = 'simple-merge'
  static description =
    'simple-merge 简单的合并算法，根据当前的 diff 数据自动生成对应的标注对象。一致的 diff 将直接生成对应标注对象，部分缺失的 diff 将根据任务配置决定是否生成标注对象，冲突的 diff 无法进行合并。当任务遇到无法处理的 diff 时，任务会选中需要处理的 diff，然后中断执行。'

  static defaultOptions: SimpleMergeOptions = {
    minRatio: 0.5,
  }
  static Form = ConfigForm

  options: SimpleMergeOptions

  constructor(readonly task: Task) {
    this.options = task.options
  }

  *saga() {
    const { editor, fileInfo }: State = yield io.select()

    try {
      const resultColl = editor.toRawColl()
      doMerge(resultColl, editor, this.options)

      const mergeCollname = yield promptDialogSaga(
        '请输入合并文件的名称：',
        getDefaultMergeCollname(fileInfo),
      )
      if (mergeCollname == null) {
        return
      }
      if (mergeCollname.length === 0) {
        yield io.put(Action.toast('文件名不能为空', Intent.WARNING))
        return
      }

      const mergeFileInfo = fileInfo.set('collname', mergeCollname)
      yield server.putColl(mergeFileInfo, resultColl)
      yield loadTreeState(false)
      yield io.spawn(showMergeCollCreatedToast, mergeFileInfo)
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
