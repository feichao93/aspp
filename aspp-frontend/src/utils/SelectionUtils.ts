import DecorationRange from '../types/DecorationRange'

namespace SelectionUtils {
  function getCompositionHeight(element: Element) {
    return Number((element as HTMLSpanElement).dataset.height)
  }

  function getOffset(span: any, textOffset = 0): number {
    if (span.dataset.skipoffset != null) {
      return getOffset(span.parentElement, 0)
    }
    return Number(span.dataset.offset) + textOffset
  }

  function findFirstTextNode(element: Element) {
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        return child
      }
    }
  }

  function findBlock(element: HTMLElement) {
    while (element != null) {
      if (element.dataset.block != null) {
        return element
      } else {
        element = element.parentElement
      }
    }
    return element
  }

  export function getCurrentRange(): DecorationRange | null {
    const sel = document.getSelection()
    if (!sel.isCollapsed) {
      const startSpan = sel.anchorNode.parentElement
      const endSpan = sel.focusNode.parentElement
      if (getOffset(startSpan) != null && getOffset(endSpan) != null) {
        const startBlock = findBlock(startSpan)
        const endBlock = findBlock(endSpan)
        if (startBlock != null && endBlock != null && startBlock === endBlock) {
          const blockIndex = Number(startBlock.dataset.blockindex)
          return new DecorationRange({
            blockIndex,
            startOffset: getOffset(startSpan, sel.anchorOffset),
            endOffset: getOffset(endSpan, sel.focusOffset),
          })
        }
      }
    }
    return null
  }

  export function setCurrentRange(decorationRange: DecorationRange) {
    const selection = document.getSelection()
    if (decorationRange == null) {
      selection.removeAllRanges()
      return
    }
    const block = document.querySelector(`*[data-blockindex="${decorationRange.blockIndex}"]`)
    const startSpan = find(block, decorationRange.startOffset)
    const endSpan = find(block, decorationRange.endOffset)
    selection.setBaseAndExtent(
      findFirstTextNode(startSpan),
      decorationRange.startOffset - getOffset(startSpan),
      findFirstTextNode(endSpan),
      decorationRange.endOffset - getOffset(endSpan),
    )

    // region function-definition
    function find(parent: Element, targetOffset: number): Element {
      let low = 0
      let high = parent.children.length - 1
      while (low < high) {
        const mid = Math.ceil((low + high) / 2)
        const midSpan = parent.children.item(mid)
        if (getOffset(midSpan) > targetOffset) {
          high = mid - 1
        } else {
          low = mid
        }
      }
      const span = parent.children.item(low)
      if (getCompositionHeight(span) > 0) {
        return find(span, targetOffset)
      }
      return span
    }
    // endregion
  }
}

export default SelectionUtils

if (process.env.NODE_ENV === 'development') {
  const injectToolsToGlobal = function(global: any) {
    global.setRange = (blockIndex: number, startOffset: number, endOffset: number) => {
      SelectionUtils.setCurrentRange(new DecorationRange({ startOffset, endOffset, blockIndex }))
    }
    global.getRange = () => {
      const range = SelectionUtils.getCurrentRange()
      return range && range.toJS()
    }
  }

  injectToolsToGlobal(global)
}
