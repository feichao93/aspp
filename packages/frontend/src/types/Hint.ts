import { Record } from 'immutable'
import Annotation from './Annotation'
import DecorationRange from './DecorationRange'

// NOTE 这里新增的 hint 类型需要在 AccecptHints.tsx 中添加对应的 handler
export type HintAction = HintAddAnnotations

export interface HintAddAnnotations {
  type: 'hint-add-annotations'
  annotation: Annotation
}

export class Hint extends Record({
  id: '',
  type: 'hint' as 'hint',
  range: new DecorationRange(),
  message: '',
  hintAction: null as HintAction,
}) {
  static fromJS(object: any) {
    return new Hint(object).update('range', DecorationRange.fromJS)
  }
}
