import { take, takeEvery } from 'redux-saga/effects'
import { delay } from 'redux-saga/utils'
import InlineAlgorithm from '../inline-algorithms/InlineAlgorithm'
import Action from '../utils/actions'
import InteractionCollector, { Interaction } from '../utils/InteractionCollector'

export default function* handleInteractions(collector: InteractionCollector) {
  const running = new Map<string, InlineAlgorithm>()

  yield takeEvery('SUBSCRIBE_ALGORITHM', handleSubscribeAlgorithm)
  yield takeEvery('UNSUBSCRIBE_ALGORITHM', handleUnsubscribeAlgorithm)

  while (true) {
    const interaction: Interaction = yield take(collector.channel, '*')
    yield delay(0)

    for (const inst of running.values()) {
      inst.onInteraction(interaction)
    }
  }

  function handleSubscribeAlgorithm({ id, inlineImplementation }: Action.SubscribeAlgorithm) {
    running.set(id, new inlineImplementation())
  }

  function handleUnsubscribeAlgorithm({ id }: Action.UnsubscribeAlgorithm) {
    const inst = running.get(id)
    running.delete(id)
    inst.dispose()
  }
}
