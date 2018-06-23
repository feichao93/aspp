import { List, Record } from 'immutable'
import { DOC_STAT_NAME } from '../utils/constants'

class FileInfo extends Record({
  docPath: List<string>(),
  docname: '',
  collName: '',
}) {
  getType(): FileInfo.FileInfoType {
    if (this.collName === DOC_STAT_NAME) {
      return 'doc-stat'
    } else if (this.collName !== '') {
      return 'coll'
    } else if (this.docname !== '') {
      return 'doc'
    } else {
      return 'directory'
    }
  }
}

namespace FileInfo {
  export type FileInfoType = 'directory' | 'doc' | 'doc-stat' | 'coll'
}

export default FileInfo
