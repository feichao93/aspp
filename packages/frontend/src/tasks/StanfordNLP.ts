import { Map, Seq } from 'immutable'
import { io } from 'little-saga/compat'
import { State } from '../reducers'
import { addAnnotations } from '../reducers/mainReducer'
import Annotation from '../types/Annotation'
import Action from '../utils/actions'
import { keyed, updateAnnotationNextId } from '../utils/common'

// TODO 配置 UI 可以参考 src/components/panels/TyModel.tsx

export interface StandfordNLPConfig {
  addr: string
  runWhenOpenDoc: boolean
  skipNonEmptyDoc: boolean
}

const defaultConfig: StandfordNLPConfig = {
  addr: 'http://10.214.224.137:5000/stanford',
  // TODO support runWhenOpenDoc & skipNonEmptyDoc
  runWhenOpenDoc: false,
  skipNonEmptyDoc: true,
}

export default class StanfordNLP {
  static disabled = true
  static defaultTaskName = 'stanford-nlp'
  static description =
    '[仍在实现中...] stanford-nlp 由斯坦福大学的 NLP 工具包提供算法，运行该任务来预先自动标注一部分实体，减少标注人员工作量。'

  constructor(readonly config = defaultConfig) {}

  *saga() {
    const { main }: State = yield io.select()
    if (main.annotations.isEmpty()) {
      const block = main.blocks.get(0)
      try {
        const res = yield fetch(this.config.addr, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: block }),
        })
        if (res.ok) {
          const json = yield res.json()
          const annotations: Map<string, Annotation> = keyed(
            Seq(json.entitylist.annotations).map(Annotation.fromJS),
          )
          updateAnnotationNextId(annotations)
          yield io.put(addAnnotations(annotations))
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
}
