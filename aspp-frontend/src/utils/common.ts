import { Set } from 'immutable'
import React from 'react'
import Decoration from '../types/Decoration'

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

export function identity<T>(arg: T): T {
  return arg
}

export function toggle<T>(set: Set<T>, t: T) {
  return set.has(t) ? set.delete(t) : set.add(t)
}

export function compareArray(arr1: number[], arr2: number[]) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return arr1[i] - arr2[i]
    }
  }
  return 0
}

export function shortenText(maxLen: number, text: string) {
  if (text.length <= maxLen) {
    return text
  } else {
    const size = text.length
    const half = Math.floor(maxLen / 2 - 1)
    return text.substring(0, half) + '...' + text.substring(size - half)
  }
}

export function getDecorationName(decoration: Decoration) {
  if (decoration.type === 'annotation') {
    return decoration.tag
  } else if (decoration.type === 'slot') {
    return decoration.slotType
  } else {
    return decoration.type
  }
}

export function always<T>(value: T) {
  return () => value
}
