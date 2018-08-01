import { Button, Checkbox, Classes, Intent, Label } from '@blueprintjs/core'
import { is, Seq } from 'immutable'
import { io, MulticastChannel } from 'little-saga'
import React from 'react'
import { ActionCategory } from '../actions/EditorAction'
import SetEditorState from '../actions/SetEditorState'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import adjustOffsets from '../sagas/adjustOffsets'
import { confirmDialogSaga } from '../sagas/dialogSaga'
import { applyEditorAction } from '../sagas/historyManager'
import Action from '../utils/actions'
import { compareDecorationPosArray, keyed } from '../utils/common'
import { Interaction } from '../utils/InteractionCollector'
import { Task } from './index'
import TaskConstructor from './TaskConstructor'

export interface SimpleOffsetAdjustingOptions {
  runWhenOpenDoc: boolean
}

interface ConfigFormProps {
  impl: TaskConstructor
  name: string
  options: SimpleOffsetAdjustingOptions
  onChangeName(nextName: string): void
  onChangeOptions(nextOptions: SimpleOffsetAdjustingOptions): void
  onClose(): void
}

type ConfigFormState = SimpleOffsetAdjustingOptions & { editingName: string }

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
    const { name, onChangeName, onClose, onChangeOptions } = this.props
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
    const { runWhenOpenDoc, editingName } = this.state

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
          <Checkbox
            checked={runWhenOpenDoc}
            label="在打开新的文档时自动运行"
            onChange={() => this.setState({ runWhenOpenDoc: !runWhenOpenDoc })}
          />
          {/* <Checkbox
            disabled
            checked={skipNonEmptyDoc}
            label="跳过已经有内容的文档"
            onChange={() => this.setState({ skipNonEmptyDoc: !skipNonEmptyDoc })}
          /> */}
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

export default class SimpleOffsetAdjusting {
  static Form = ConfigForm
  static singleton = true
  static defaultTaskName = 'simple-offset-adjusting'
  static defaultOptions: SimpleOffsetAdjustingOptions = {
    runWhenOpenDoc: false,
  }
  static description =
    'simple-offset-adjusting 会根据标注的 entity 字段来调整其偏移量。部分算法处理文本文件或标注文件时，会对文本进行修改，例如去掉空白字符，导致标注的偏移量出错，此时运行 simple-offset-adjusting 可以修复标注的偏移量'

  options: SimpleOffsetAdjustingOptions

  constructor(readonly task: Task) {
    this.options = task.options
  }

  *saga(chan: MulticastChannel<Interaction>) {
    if (this.options.runWhenOpenDoc) {
      while (true) {
        yield io.take(chan, 'COLL_OPENED')
        yield* this.run()
      }
    } else {
      yield* this.run()
    }
  }

  *run() {
    const name = this.task.name
    const { editor }: State = yield io.select()
    const block = editor.blocks.first()
    const annotations = editor.annotations
      .valueSeq()
      .sort(compareDecorationPosArray)
      .toArray()
    const { adjusted, failed } = adjustOffsets(block, annotations)

    if (failed.length > 0) {
      const confirmed = yield confirmDialogSaga(
        <span>
          {Rich.number(name)} 部分标注的偏移量无法进行修复，修复偏移量时将删除这些标注。确认吗？
        </span>,
      )
      if (!confirmed) {
        return
      }
    }

    const nextAnnotations = keyed(Seq(adjusted))
    if (is(editor.annotations, nextAnnotations)) {
      yield io.put(Action.toast(`${name} 没有发现需要进行修复的标注`, Intent.PRIMARY))
      return
    }
    const edit = new SetEditorState(
      editor.set('annotations', nextAnnotations),
      `${name} 更新标注数据`,
    ).withCategory(ActionCategory.task)
    yield applyEditorAction(edit)
    yield io.put(Action.toast(`${name} 修复完成`, Intent.PRIMARY))
  }
}
