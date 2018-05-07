import Annotation from './Annotation'
import { Record } from 'immutable'
import DecorationRange from './DecorationRange'

export class Text extends Record({
  id: '',
  type: 'text' as 'text',
  range: new DecorationRange(),
}) {
  static fromJS(object: any) {
    return new Hint(object).update('range', DecorationRange.fromJS)
  }
}

export class Hint extends Record({
  id: '',
  type: 'hint' as 'hint',
  range: new DecorationRange(),
  hint: '',
  // TODO actions
}) {
  static fromJS(object: any) {
    return new Hint(object).update('range', DecorationRange.fromJS)
  }
}

export class Slot extends Record({
  id: '',
  type: 'slot' as 'slot',
  slotType: '',
  range: new DecorationRange(),
}) {
  static fromJS(object: any) {
    return new Slot(object).update('range', DecorationRange.fromJS)
  }
}

type Decoration = Text | Annotation | Hint | Slot

namespace Decoration {
  export function isAnnotation(decoration: Decoration): decoration is Annotation {
    return decoration.type === 'annotation'
  }

  export function isText(decoration: Decoration): decoration is Text {
    return decoration.type === 'text'
  }

  export function isHint(decoration: Decoration): decoration is Hint {
    return decoration.type === 'hint'
  }

  export function isSlot(decoration: Decoration): decoration is Slot {
    return decoration.type === 'slot'
  }

  export function getPosition({ range: { blockIndex, startOffset, endOffset } }: Decoration) {
    return [blockIndex, startOffset, endOffset]
  }
}

export default Decoration
