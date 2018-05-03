import Annotation from './Annotation'
import { Record } from 'immutable'
import DecorationRange from './DecorationRange'

export class AnnotationDecoration extends Record({
  type: 'annotation',
  range: new DecorationRange(),
  annotation: new Annotation(),
}) {}

export class Text extends Record({
  type: 'text',
  range: new DecorationRange(),
}) {}

export class Hint extends Record({
  type: 'hint',
  range: new DecorationRange(),
  hint: '',
  // TODO actions
}) {}

export class Slot extends Record({
  type: 'slot',
  slotType: '',
  range: new DecorationRange(),
}) {}

type Decoration = Text | AnnotationDecoration | Hint | Slot

namespace Decoration {
  export function isAnnotation(decoration: Decoration): decoration is AnnotationDecoration {
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

  export function fromAnnotation(annotation: Annotation) {
    return new AnnotationDecoration({
      type: 'annotation',
      range: annotation.range,
      annotation,
    })
  }

  export function getPosition({ range: { blockIndex, startOffset, endOffset } }: Decoration) {
    return [blockIndex, startOffset, endOffset]
  }
}

export default Decoration
