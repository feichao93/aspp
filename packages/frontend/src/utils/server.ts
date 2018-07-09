import { DocStatItem } from '../reducers/docStatReducer'
import { TreeItem } from '../reducers/treeReducer'
import { RawAnnotation } from '../types/Annotation'
import { RawSlot } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import FileInfo from '../types/FileInfo'
import { compareDecorationPosArray } from './common'

type FetchLike = (url?: string, init?: RequestInit) => Promise<Response>

const encode = encodeURIComponent

function withPrefix(prefix: string) {
  return (next: FetchLike): FetchLike => (url, init) => next(`${prefix}${url}`, init)
}

function guardOK(next: FetchLike): FetchLike {
  return (url, init) =>
    next(url, init).then(res => {
      if (!res.ok) {
        throw makeError(res)
      }
      return res
    })
}

const prepend = (prefix: string) => (s: string) => prefix + s

function makeError(res: Response) {
  return new Error(`${res.status} ${res.statusText}`)
}

function makeDocPath({ docPath, docname }: FileInfo) {
  const path = docPath
    .map(encode)
    .map(prepend('/'))
    .join('')
  return `${path}/${encode(docname)}`
}

function makeDocUrl(info: FileInfo) {
  return `/doc${makeDocPath(info)}`
}

function makeDocStatUrl(info: FileInfo) {
  return `/doc-stat${makeDocPath(info)}`
}

function makeCollUrl(info: FileInfo) {
  return `/coll${makeDocPath(info)}?collname=${encode(info.collname)}`
}
function makeRenameCollUrl(info: FileInfo) {
  return `/rename/coll${makeDocPath(info)}?collname=${encode(info.collname)}`
}

const asppFetch = withPrefix('/api')(guardOK(fetch))

export interface RawColl {
  // TODO meta
  annotations: RawAnnotation[]
  slots: RawSlot[]
}

export default {
  async list(reload = false): Promise<TreeItem[]> {
    const url = reload ? '/list?reload' : '/list'
    const res = await asppFetch(url)
    return await res.json()
  },

  async getDocStat(info: FileInfo): Promise<DocStatItem> {
    const res = await asppFetch(makeDocStatUrl(info))
    return await res.json()
  },

  async getDoc(info: FileInfo): Promise<string[]> {
    const res = await asppFetch(makeDocUrl(info))
    return await res.json()
  },

  async getColl(info: FileInfo): Promise<RawColl> {
    const res = await asppFetch(makeCollUrl(info))
    return await res.json()
  },

  async putColl(info: FileInfo, coll: RawColl): Promise<void> {
    coll.annotations = coll.annotations || []
    coll.annotations.sort(compareDecorationPosArray)
    coll.annotations.forEach(annotation => {
      annotation.range = DecorationRange.normalize(annotation.range)
    })

    coll.slots = coll.slots || []
    coll.slots.sort(compareDecorationPosArray)
    coll.slots.forEach(slot => {
      slot.range = DecorationRange.normalize(slot.range)
    })

    await asppFetch(makeCollUrl(info), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(coll),
    })
  },

  async deleteColl(info: FileInfo): Promise<void> {
    await asppFetch(makeCollUrl(info), { method: 'DELETE' })
  },
  async renameColl(info: FileInfo, newName: string): Promise<void> {
    await asppFetch(makeRenameCollUrl(info), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ newName }),
    })
  },
}
