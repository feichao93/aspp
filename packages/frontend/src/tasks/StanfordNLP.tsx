import { Button, Checkbox, Classes, Intent, Label } from '@blueprintjs/core'
import { Map, Seq } from 'immutable'
import { io } from 'little-saga/compat'
import * as React from 'react'
import { ActionCategory } from '../actions/EditorAction'
import SetEditorState from '../actions/SetEditorState'
import ASPP_CONFIG from '../aspp-config'
import { State } from '../reducers'
import { applyEditorAction } from '../sagas/historyManager'
import Annotation from '../types/Annotation'
import Action from '../utils/actions'
import { keyed, remove, updateAnnotationNextId } from '../utils/common'
import { Task } from './index'
import TaskConstructor from './TaskConstructor'

interface ConfigFormProps {
  impl: TaskConstructor
  name: string
  options: StandfordNLPOptions
  onChangeName(nextName: string): void
  onChangeOptions(nextOptions: StandfordNLPOptions): void
  onClose(): void
}

class ConfigForm extends React.Component<ConfigFormProps, StandfordNLPOptions> {
  constructor(props: ConfigFormProps) {
    super(props)
    this.state = props.options
  }

  onConfirm = () => {
    const { onClose, onChangeOptions } = this.props
    const { ...nextOptions } = this.state
    onChangeOptions(nextOptions)
    onClose()
  }

  toggle = (tagName: string) => {
    const { tagNameList } = this.state
    const nextTagNameList = tagNameList.slice()
    if (nextTagNameList.includes(tagName)) {
      remove(nextTagNameList, tagName)
    } else {
      nextTagNameList.push(tagName)
    }
    this.setState({ tagNameList: nextTagNameList })
  }

  render() {
    const { onClose } = this.props
    const { runWhenOpenDoc, addr, tagNameList } = this.state

    return (
      <div>
        <div className={Classes.DIALOG_HEADER}>配置 {name}</div>
        <div className={Classes.DIALOG_BODY}>
          <Label text="服务地址" inline>
            <input
              value={addr}
              className={Classes.INPUT}
              style={{ width: '85%' }}
              onChange={e => this.setState({ addr: e.target.value })}
            />
          </Label>
          {/*<Checkbox*/}
          {/*disabled*/}
          {/*checked={runWhenOpenDoc}*/}
          {/*label="在打开新的文档时自动运行"*/}
          {/*onChange={() => this.setState({ runWhenOpenDoc: !runWhenOpenDoc })}*/}
          {/*/>*/}
          {ASPP_CONFIG.asppConfig.tags
            .map(tag => tag.name)
            .map(tagName => (
              <Checkbox
                key={tagName}
                checked={tagNameList.includes(tagName)}
                label={tagName}
                onChange={() => this.toggle(tagName)}
              />
            ))}
          {/*<Checkbox*/}
          {/*disabled*/}
          {/*checked={skipNonEmptyDoc}*/}
          {/*label="跳过已经有内容的文档"*/}
          {/*onChange={() => this.setState({ skipNonEmptyDoc: !skipNonEmptyDoc })}*/}
          {/*/>*/}
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

export interface StandfordNLPOptions {
  addr: string
  runWhenOpenDoc: boolean
  // skipNonEmptyDoc: boolean
  tagNameList: string[]
}

export default class StanfordNLP {
  static defaultTaskName = 'stanford-nlp'
  static description =
    '[仍在实现中...] stanford-nlp 由斯坦福大学的 NLP 工具包提供算法，运行该任务来预先自动标注一部分实体，减少标注人员工作量。'
  static defaultOptions: StandfordNLPOptions = {
    addr: 'http://10.214.224.137:5000/stanford',
    runWhenOpenDoc: false,
    // skipNonEmptyDoc: true,
    tagNameList: ASPP_CONFIG.asppConfig.tags.map(tag => tag.name),
  }
  static Form = ConfigForm

  options: StandfordNLPOptions

  constructor(task: Task) {
    this.options = task.options
  }

  *saga() {
    const { editor }: State = yield io.select()
    if (!editor.annotations.isEmpty()) {
      yield io.put(
        Action.toast(`${StanfordNLP.defaultTaskName} 无法处理已有标注数据的情况`, Intent.WARNING),
      )
      return
    }
    const block = editor.blocks.get(0)
    try {
      const res = yield fetch(this.options.addr, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: block }),
      })
      if (res.ok) {
        const json = yield res.json()
        const annotations: Map<string, Annotation> = keyed(
          Seq(json.entitylist.annotations)
            .map(Annotation.fromJS)
            .filter((annotation: Annotation) => this.options.tagNameList.includes(annotation.tag)),
        )
        updateAnnotationNextId(annotations)
        const nextEditorState = editor.set('annotations', annotations)
        yield applyEditorAction(
          new SetEditorState(
            nextEditorState,
            `${StanfordNLP.defaultTaskName} 更新标注数据`,
          ).withCategory(ActionCategory.task),
        )
        yield io.put(
          Action.toast(
            `${StanfordNLP.defaultTaskName} 添加 ${annotations.size} 个标注`,
            Intent.PRIMARY,
          ),
        )
      } else {
        console.error(res)
        yield io.put(Action.toast('运行失败'))
      }
    } catch (e) {
      console.error(e)
      yield io.put(Action.toast('运行失败'))
    }
  }
}
