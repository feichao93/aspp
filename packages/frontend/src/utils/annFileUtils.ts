import MainState from '../types/MainState'
import layout from './layout'

export function generateANNFile(main: MainState) {
  // TODO 暂时先只考虑 block-0
  const block = main.blocks.get(0)
  const lines: string[] = []
  const rootNode = layout(block, 0, main.annotations.toSet())
  for (const { decoration } of rootNode.children) {
    const { startOffset, endOffset } = decoration.range
    if (decoration.type === 'text') {
      for (let i = startOffset; i < endOffset; i++) {
        lines.push(`${block[i]}\tO`) // other
      }
    } else if (decoration.type === 'annotation') {
      if (startOffset + 1 === endOffset) {
        lines.push(`${block[startOffset]}\tS-${decoration.tag}`)
      } else {
        // BME
        lines.push(`${block[startOffset]}\tB-${decoration.tag}`)
        for (let i = startOffset + 1; i < endOffset - 1; i++) {
          lines.push(`${block[i]}\tM-${decoration.tag}`)
        }
        lines.push(`${block[endOffset - 1]}\tE-${decoration.tag}`)
      }
    }
  }

  return {
    filename: `${main.docname}-${main.collName}.ann`,
    content: lines.join('\n'),
  }
}
