import MainState from '../types/MainState'
import Action from '../utils/actions'
import mainReducer from './mainReducer'
import miscReducer, { MiscState } from './miscReducer'

export interface State {
  main: MainState
  misc: MiscState
  // TODO history for mainState
}

export default function reducer(state: State = {} as any, action: Action): State {
  return {
    misc: miscReducer(state.misc, action),
    main: mainReducer(state.main, action),
  }
}
