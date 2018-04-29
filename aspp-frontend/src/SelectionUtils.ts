import AnnotationRange from './types/AnnotationRange'

function getCurrentRange(): AnnotationRange | null {
  const sel = document.getSelection()
  if (!sel.isCollapsed) {
    const range = sel.getRangeAt(0)
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
        return new AnnotationRange({
          blockIndex,
          startOffset: Number(startSpan.dataset.offset) + range.startOffset,
          endOffset: Number(endSpan.dataset.offset) + range.endOffset,
        })
      }
    }
  }
  return null
}

function getOffset(element: Element) {
  return Number((element as HTMLSpanElement).dataset.offset)
}

let ignoreCount = 0

function setCurrentRange(annotationRange: AnnotationRange) {
  console.log(annotationRange.toString())
  const block = document.querySelector(`*[data-blockindex="${annotationRange.blockIndex}"]`)
  const spans = block.children
  const selection = document.getSelection()
  const startSpan = find(annotationRange.startOffset)
  const endSpan = find(annotationRange.endOffset)
  ignoreCount++
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

// TODO 目前这样的写法只支持同时存在一个 listener
function on(listener: () => void) {
  const cb = () => {
    if (ignoreCount > 0) {
      ignoreCount--
    } else {
      listener()
    }
  }
  document.addEventListener('selectionchange', cb)
  return () => document.removeEventListener('selectionchange', cb)
}

export default { getCurrentRange, setCurrentRange, on }

if (process.env.NODE_ENV === 'development') {
  const injectToolsToGlobal = function(global: any) {
    global.setRange = (blockIndex: number, startOffset: number, endOffset: number) => {
      setCurrentRange(new AnnotationRange({ startOffset, endOffset, blockIndex }))
    }
    global.getRange = () => {
      const range = getCurrentRange()
      return range && range.toJS()
    }
  }

  injectToolsToGlobal(global)
}
