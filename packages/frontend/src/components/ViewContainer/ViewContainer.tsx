import { NonIdealState } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { ConfigState } from '../../reducers/configReducer'
import MainState from '../../types/MainState'
import AnnotationEditor from '../AnnotationEditor/AnnotationEditor'
import DocStat from '../DocStat/DocStat'
import './ViewContainer.styl'

interface ViewContainerProps {
  main: MainState
  config: ConfigState
  dispatch: Dispatch
}

class ViewContainer extends React.Component<ViewContainerProps> {
  render() {
    const { main } = this.props
    let content: JSX.Element
    if (main.getStatus() === 'closed') {
      content = (
        <NonIdealState
          visual="folder-shared-open"
          title="尚未打开文件"
          description="请在左侧打开或新建标注文件"
        />
      )
    } else if (main.getStatus() === 'doc-stat') {
      content = <DocStat />
    } else {
      content = <AnnotationEditor {...this.props} />
    }

    return <div className="view-container">{content}</div>
  }
}

export default connect(({ main, config }: State) => ({ main, config }))(ViewContainer)
