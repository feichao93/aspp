import AnnotationRange from './types/AnnotationRange'

export function getCurrentRange(): AnnotationRange | null {
  const sel = window.getSelection()
  if (!sel.isCollapsed) {
    const range = sel.getRangeAt(0)
    const startSpan = range.startContainer.parentElement
    const endSpan = range.endContainer.parentElement
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

export function setCurrentRange(annotationRange: AnnotationRange) {
  const block = document.querySelector(`*[data-blockindex="${annotationRange.blockIndex}"]`)
  const spans = block.children
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(annotationRangeToNativeRange(annotationRange))

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

  function annotationRangeToNativeRange(annotationRange: AnnotationRange) {
    const nativeRange = new Range()
    const startSpan = find(annotationRange.startOffset)
    const endSpan = find(annotationRange.endOffset)
    nativeRange.setStart(startSpan.firstChild, annotationRange.startOffset - getOffset(startSpan))
    nativeRange.setEnd(endSpan.firstChild, annotationRange.endOffset - getOffset(endSpan))
    return nativeRange
  }
  // endregion
}

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
