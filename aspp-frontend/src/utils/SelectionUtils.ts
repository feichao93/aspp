import DecorationRange from '../types/DecorationRange'

function getCurrentRange(): DecorationRange | null {
  const sel = document.getSelection()
  if (!sel.isCollapsed) {
    const startSpan = sel.anchorNode.parentElement
    const endSpan = sel.focusNode.parentElement
    if (
      startSpan.dataset &&
      startSpan.dataset.offset != null &&
      endSpan.dataset &&
      endSpan.dataset.offset != null
    ) {
      const block = startSpan.parentElement
      if (block === endSpan.parentElement) {
        const blockIndex = Number(block.dataset.blockindex)
        return new DecorationRange({
          blockIndex,
          startOffset: Number(startSpan.dataset.offset) + sel.anchorOffset,
          endOffset: Number(endSpan.dataset.offset) + sel.focusOffset,
        })
      }
    }
  }
  return null
}

function getOffset(element: Element) {
  return Number((element as HTMLSpanElement).dataset.offset)
}

function setCurrentRange(annotationRange: DecorationRange) {
  const selection = document.getSelection()
  if (annotationRange == null) {
    selection.removeAllRanges()
    return
  }
  const block = document.querySelector(`*[data-blockindex="${annotationRange.blockIndex}"]`)
  const spans = block.children
  const startSpan = find(annotationRange.startOffset)
  const endSpan = find(annotationRange.endOffset)
  selection.setBaseAndExtent(
    startSpan.firstChild,
    annotationRange.startOffset - getOffset(startSpan),
    endSpan.firstChild,
    annotationRange.endOffset - getOffset(endSpan),
  )

  // region function-definition
  function find(targetOffset: number) {
    let low = 0
    let high = spans.length - 1
    while (low < high) {
      const mid = Math.ceil((low + high) / 2)
      const midSpan = spans.item(mid)
      if (getOffset(midSpan) > targetOffset) {
        high = mid - 1
      } else {
        low = mid
      }
    }
    return spans.item(low)
  }
  // endregion
}

const SelectionUtils = { getCurrentRange, setCurrentRange }
export default SelectionUtils

if (process.env.NODE_ENV === 'development') {
  const injectToolsToGlobal = function(global: any) {
    global.setRange = (blockIndex: number, startOffset: number, endOffset: number) => {
      setCurrentRange(new DecorationRange({ startOffset, endOffset, blockIndex }))
    }
    global.getRange = () => {
      const range = getCurrentRange()
      return range && range.toJS()
    }
  }

  injectToolsToGlobal(global)
}
