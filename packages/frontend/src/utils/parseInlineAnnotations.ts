import { Parser } from 'pegjs'
import { RawAnnotation } from '../types/Annotation'

// tslint:disable no-var-requires
export let basicParser: Parser

if (typeof WEBPACK_BUILD !== 'undefined' && WEBPACK_BUILD) {
  basicParser = require('./inline-coll.pegjs')
} else {
  const fs = require('fs')
  const pegjs = require('pegjs')
  const source = fs.readFileSync('./src/utils/inline-coll.pegjs', 'utf8')
  basicParser = pegjs.generate(source)
}

export function parseInlineAnnotations(str: string) {
  const parsed = basicParser.parse(str)
  const annotations: RawAnnotation[] = []
  const blockParts: string[] = []
  let annotationIndex = 0
  let index = 0

  for (const item of parsed) {
    if (typeof item === 'string') {
      blockParts.push(item)
      index += item.length
    } else {
      const { entity, tag, placeholder } = item as {
        entity: string
        tag: string
        placeholder?: boolean
      }
      blockParts.push(entity)
      if (!placeholder) {
        annotations.push({
          type: 'annotation',
          id: `annotation-${annotationIndex++}`,
          entity,
          tag,
          range: {
            blockIndex: 0,
            startOffset: index,
            endOffset: index + entity.length,
          },
        })
      }
      index += entity.length
    }
  }

  return { block: blockParts.join(''), annotations }
}
