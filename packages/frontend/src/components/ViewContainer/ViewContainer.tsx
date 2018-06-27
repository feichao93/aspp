import { NonIdealState } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { State } from '../../reducers'
import FileInfo from '../../types/FileInfo'
import AnnotationEditor from '../AnnotationEditor/AnnotationEditor'
import DocStat from '../DocStat/DocStat'
import './ViewContainer.styl'

interface ViewContainerProps {
  fileInfo: FileInfo
}

class ViewContainer extends React.Component<ViewContainerProps> {
  render() {
    const { fileInfo } = this.props
    let content: JSX.Element
    if (fileInfo.getType() === 'empty') {
      content = (
        <NonIdealState
          visual="folder-shared-open"
          title="尚未打开文件"
          description="请在左侧打开或新建标注文件"
        />
      )
    } else if (fileInfo.getType() === 'doc-stat') {
      content = <DocStat />
    } else if (fileInfo.getType() === 'coll') {
      content = <AnnotationEditor key={fileInfo.getFullName()} />
    } else {
      throw new Error('Invalid fileInfo type')
    }

    return <div className="view-container">{content}</div>
  }
}

export default connect((s: State) => ({ fileInfo: s.fileInfo }))(ViewContainer)
