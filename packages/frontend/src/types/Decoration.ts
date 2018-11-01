import { Record } from 'immutable'
import { getNextId } from '../utils/common'
import Annotation from './Annotation'
import DecorationRange, { RawRange } from './DecorationRange'
import { Hint } from './Hint'

export class Text extends Record({
  id: '',
  type: 'text' as 'text',
  range: new DecorationRange(),
}) {
  static fromJS(object: any) {
    return new Hint(object).update('range', DecorationRange.fromJS)
  }
}

export interface RawSlot {
  id: string
  type: 'slot'
  slotType: string
  range: RawRange
  data: any
}

export class Slot extends Record({
  id: '',
  type: 'slot' as 'slot',
  slotType: '',
  range: new DecorationRange(),
  data: null as any,
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

  export function asPlainSlot(decoration: Decoration): Slot {
    return new Slot(decoration).merge({
      type: 'slot',
      slotType: 'plain',
    })
  }

  export function isPlainSlot(decoration: Decoration) {
    return decoration.type === 'slot' && decoration.slotType === 'plain'
  }
}

export default Decoration
