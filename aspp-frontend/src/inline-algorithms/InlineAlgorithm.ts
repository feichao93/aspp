import Action from '../utils/actions'
import { Interaction } from '../utils/InteractionCollector'
import store from '../store'

export default abstract class InlineAlgorithm {
  abstract onInteraction(interaction: Interaction): void

  dispose() {}

  getState() {
    return store.getState()
  }

  dispatch(action: Action) {
    return store.dispatch(action)
  }
}
