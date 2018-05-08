import { is, List } from 'immutable'
import { put, select, take } from 'redux-saga/effects'
import { State } from '../reducers'
import Annotation from '../types/Annotation'
import { Hint } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import { addDecorations } from '../utils/actionCreators'
import { getNextId, keyed } from '../utils/common'
import findMatch from '../utils/findMatch'
import InteractionCollector, { Interaction } from '../utils/InteractionCollector'

export default function* handleInteractions(collector: InteractionCollector) {
  while (true) {
    const interaction: Interaction = yield take(collector.channel, '*')

    if (interaction.type === 'USER_ANNOTATE_TEXT') {
      const { range, tag } = interaction
      const { main }: State = yield select()
      const text = DecorationRange.getText(main.doc, range)
      const gathered = main.gather()

      const hints = List(main.doc.blocks)
        .flatMap((block, blockIndex) => findMatch(block, blockIndex, gathered, text))
        .filterNot(r => is(r, range))
        .map(
          range =>
            new Hint({
              range,
              id: getNextId('hint'),
              hint: `Apply ${tag}`,
              action: addDecorations(
                keyed(List.of(new Annotation({ range, id: getNextId('annotation'), tag }))),
              ),
            }),
        )
      if (!hints.isEmpty()) {
        console.log('generating hints', hints.toJS())
        yield put(addDecorations(keyed(hints)))
      }
    } else {
      throw new Error()
    }
  }
}
