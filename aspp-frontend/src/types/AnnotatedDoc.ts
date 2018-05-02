import { Record, Set } from 'immutable'
import Annotation from './Annotation'
import PlainDoc from './PlainDoc'

const AnnotatedDocRecord = Record({
  id: '',
  author: '',
  plainDoc: new PlainDoc(),
  annotationSet: Set<Annotation>(),
})

export default class AnnotatedDoc extends AnnotatedDocRecord {
  static fromJS(object: any) {
    return new AnnotatedDoc(object)
      .update('plainDoc', PlainDoc.fromJS)
      .update('annotationSet', set => Set(set).map(Annotation.fromJS))
  }
}
