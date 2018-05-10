import { is, List } from 'immutable'
import Annotation from '../types/Annotation'
import { Hint } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import { addAnnotations, addHints } from '../utils/actionCreators'
import { getNextId, keyed } from '../utils/common'
import findMatch from '../utils/findMatch'
import { Interaction } from '../utils/InteractionCollector'
import InlineAlgorithm from './InlineAlgorithm'

export default class SimpleMatching extends InlineAlgorithm {
  constructor() {
    super()
    console.log('SimpleMatching started...')
  }

  dispose() {
    console.log('SimpleMatching dispose')
  }

  onInteraction(interaction: Interaction) {
    console.log('SimpleMatching onInteraction:', interaction)

    if (interaction.type === 'USER_ANNOTATE_TEXT') {
      const { range, tag } = interaction
      const { main } = this.getState()
      const text = DecorationRange.getText(main.doc, range)
      const gathered = main.gather()

      const hints = List(main.doc.blocks)
        .flatMap((block, blockIndex) => findMatch(block, blockIndex, gathered, text))
        .filterNot(r => is(r, range.normalize()))
        .map(
          range =>
            new Hint({
              range,
              id: getNextId('hint'),
              hint: `Apply ${tag}`,
              action: addAnnotations(keyed(List.of(Annotation.annotateRange(tag, range)))),
            }),
        )

      if (!hints.isEmpty()) {
        this.dispatch(addHints(keyed(hints)))
      }
    }
  }
}
