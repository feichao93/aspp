import React from 'react'

export function preventDefault(event: React.MouseEvent<any>) {
  event.preventDefault()
}

class DefaultMap<K, V> extends Map<K, V> {
  constructor(readonly defaulter: () => V) {
    super()
  }

  get(k: K) {
    if (!this.has(k)) {
      this.set(k, this.defaulter())
    }
    return super.get(k)
  }
}

const nextIdMap = new DefaultMap(() => 1)
export function getNextId(tag: string) {
  const nextId = nextIdMap.get(tag)
  nextIdMap.set(tag, nextId + 1)
  return `${tag}-${nextId}`
}

function findBlockAncestor(startElement: HTMLElement) {
  let elem = startElement
  while (elem != null) {
    if (elem.dataset && elem.dataset.block) {
      return elem
    }
    elem = elem.parentElement
  }
}

// TODO 有 bug，该函数获取到的并不是block中的offset，而是span中的offset
export function getCurrentRange() {
  const sel = window.getSelection()
  if (!sel.isCollapsed) {
    const range = sel.getRangeAt(0)
    const startBlockElem = findBlockAncestor(range.startContainer as HTMLSpanElement)
    const endBlockElem = findBlockAncestor(range.endContainer as HTMLSpanElement)
    if (startBlockElem && endBlockElem && startBlockElem == endBlockElem) {
      const blockIndex = Number(startBlockElem.dataset.blockindex)
      return {
        blockIndex,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
      }
    }
  }
  // TODO make a toast showing 'invalid selection'
  return null
}
