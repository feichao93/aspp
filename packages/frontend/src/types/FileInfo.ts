import { List, Range, Record } from 'immutable'
import { prepend } from '../utils/common'
import { DOC_STAT_NAME } from '../utils/constants'

export type FileInfoType = 'directory' | 'doc' | 'doc-stat' | 'coll' | 'empty'

export default class FileInfo extends Record({
  docPath: List<string>(),
  docname: '',
  collname: '',
}) {
  getType(): FileInfoType {
    if (this.collname === DOC_STAT_NAME) {
      return 'doc-stat'
    } else if (this.collname !== '') {
      return 'coll'
    } else if (this.docname !== '') {
      return 'doc'
    } else if (this.docPath.isEmpty()) {
      return 'empty'
    } else {
      return 'directory'
    }
  }

  isAncestorOf(other: FileInfo) {
    if (this.docPath.size >= other.docPath.size) {
      return false
    }
    if (!Range(0, this.docPath.size).every(i => other.docPath.get(i) === this.docPath.get(i))) {
      return false
    }
    if (this.getType() === 'directory') {
      return true
    }
    if (this.getType() === 'doc') {
      return other.docname === this.docname && other.getType() === 'coll'
    }
    return false
  }

  getDirStr() {
    return this.docPath.map(prepend('/')).join('')
  }

  getFullName() {
    const type = this.getType()
    if (type === 'empty') {
      return '[空]'
    } else if (type === 'directory') {
      return `目录 ${this.getDirStr()}/`
    } else if (type === 'doc') {
      return `文本文件 ${this.getDirStr()}/${this.docname}`
    } else if (type === 'coll') {
      return `标注文件 ${this.getDirStr()}/${this.docname}-${this.collname}`
    } else {
      return `统计 ${this.getDirStr()}/${this.docname}`
    }
  }
}
