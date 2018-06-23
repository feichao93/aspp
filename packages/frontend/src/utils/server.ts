import fs from 'fs'
import { TreeItem } from '../reducers/treeReducer'
import { RawAnnotation } from '../types/Annotation'
import FileInfo from '../types/FileInfo'

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
    .join()
  return `${path}/${encode(docname)}`
}

function makeDocUrl(info: FileInfo) {
  return `/doc${makeDocPath(info)}`
}

function makeDocStatUrl(info: FileInfo) {
  return `/doc-stat${makeDocPath(info)}`
}

function makeCollUrl(info: FileInfo) {
  return `/coll${makeDocPath(info)}?collname=${encode(info.collName)}`
}

const asppFetch = withPrefix('/api')(guardOK(fetch))

// TODO 完善 Coll
interface Coll {
  annotations: RawAnnotation[]
}

export default {
  async list(reload = false): Promise<TreeItem[]> {
    const url = reload ? '/list?reload' : '/list'
    const res = await asppFetch(url)
    return await res.json()
  },

  async getDocStat(
    info: FileInfo,
  ): Promise<{
    // TODO 和已有的类型定义进行合并
    collName: string
    annotationCount: number
    fileStat: fs.Stats
  }> {
    const res = await asppFetch(makeDocStatUrl(info))
    return await res.json()
  },

  async getDoc(info: FileInfo): Promise<string[]> {
    const res = await asppFetch(makeDocUrl(info))
    return await res.json()
  },

  async getColl(info: FileInfo): Promise<Coll> {
    const res = await asppFetch(makeCollUrl(info))
    return await res.json()
  },

  async putColl(info: FileInfo, coll: Coll): Promise<void> {
    await asppFetch(makeCollUrl(info), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(coll),
    })
  },

  async deleteColl(info: FileInfo): Promise<void> {
    await asppFetch(makeCollUrl(info), { method: 'DELETE' })
  },
}
