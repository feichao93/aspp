import { getDecorationName } from './common'
import { SpanInfo } from './layout'

export default function stringifySpanLayout(block: string, spanInfoArray: SpanInfo[]) {
  function dfs(spanInfo: SpanInfo): string {
    if (spanInfo.height > 0) {
      return `${getDecorationName(spanInfo.decoration)}[ ${spanInfo.children.map(dfs).join(', ')} ]`
    } else {
      const decoration = spanInfo.decoration
      if (decoration.type === 'text') {
        return JSON.stringify(
          block.substring(decoration.range.startOffset, decoration.range.endOffset),
        )
      } else if (decoration.type === 'annotation') {
        return JSON.stringify(
          `${decoration.annotation.tag}:${block.substring(
            decoration.range.startOffset,
            decoration.range.endOffset,
          )}`,
        )
      } else {
        return String(spanInfo.decoration)
      }
    }
  }

  return spanInfoArray.map(dfs).join(', ')
}
