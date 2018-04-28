import { List, Record } from 'immutable'

const PlainDocRecord = Record({
  id: '',
  blocks: List<string>(),
})

export default class PlainDoc extends PlainDocRecord {
  static fromJS(object: any) {
    return new PlainDoc(object).update('blocks', List)
  }
}
