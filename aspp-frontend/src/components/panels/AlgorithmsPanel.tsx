import { Icon, Position, Switch, Tooltip } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import SimpleMatching from '../../inline-algorithms/SimpleMatching'
import Action from '../../utils/actions'
import './AlgorithmsPanel.styl'

const SIMPLE_MATCHING_DESCRIPTION =
  'simple-matching 是最基本的匹配方法，开启该算法之后，每当用户对某一段文本进行标注时，算法会寻找相同的文本并给出对应的提示'

class AlgorithmsPanel extends React.Component<{ dispatch: Dispatch }> {
  state = {
    simpleMatch: false,
  }

  handleToggleSimpleMatch = () => {
    const { dispatch } = this.props
    const { simpleMatch } = this.state
    this.setState({ simpleMatch: !simpleMatch })
    if (!simpleMatch) {
      // 用户开启了 simple-match
      dispatch<Action>({
        id: 'simple-matching',
        type: 'SUBSCRIBE_ALGORITHM',
        algorithmType: 'inline',
        inlineImplementation: SimpleMatching,
      })
    } else {
      dispatch<Action>({ type: 'UNSUBSCRIBE_ALGORITHM', id: 'simple-matching' })
    }
  }

  render() {
    const { simpleMatch } = this.state
    return (
      <div className="panel algorithms-panel">
        <div className="online-part">
          <p className="part-title" style={{ display: 'flex', marginBottom: 8 }}>
            在线算法
          </p>
          <div style={{ display: 'flex' }}>
            <Switch
              style={{ marginRight: 8 }}
              checked={simpleMatch}
              label="simple-matching"
              onChange={this.handleToggleSimpleMatch}
            />
            <Tooltip
              content={<p style={{ width: 250 }}>{SIMPLE_MATCHING_DESCRIPTION}</p>}
              position={Position.TOP}
            >
              <Icon icon="info-sign" title={null} />
            </Tooltip>
          </div>
        </div>
        <div className="online-part">
          <p className="part-title" style={{ display: 'flex', margin: '8px 0' }}>
            离线算法：暂无
          </p>
        </div>
        {/*<div style={{ marginLeft: 8 }}>*/}
        {/*<p>对算法参数进行配置</p>*/}
        {/*<p>初级: 导入导出 yaml/json 文件来进行配置</p>*/}
        {/*<p>高级: 提供交互式 UI 来进行配置</p>*/}
        {/*<br />*/}
        {/*<p>运行离线算法 以及 订阅在线算法</p>*/}
        {/*<p>查看算法运行情况</p>*/}
        {/*</div>*/}
      </div>
    )
  }
}

export default connect()(AlgorithmsPanel)
