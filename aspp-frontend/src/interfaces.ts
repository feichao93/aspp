export interface PlainDoc {
  readonly id: string
  readonly blocks: ReadonlyArray<string>
}

export interface AnnotationRange {
  readonly blockIndex: number
  readonly startOffset: number
  readonly endOffset: number
}

export interface Annotation {
  readonly id: string
  readonly range: AnnotationRange
  readonly confidence: number
  readonly tag: string
}

// TODO 需要换成 Immutable 数据结构
export interface AnnotatedDoc {
  readonly author: string
  readonly plainDoc: PlainDoc
  readonly annotationSet: ReadonlySet<Annotation>
}
