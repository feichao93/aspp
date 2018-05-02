import React from 'react'
import './AlgorithmsPanel.styl'

export default class AlgorithmsPanel extends React.Component {
  render() {
    return (
      <div className="panel algorithms-panel">
        <h2>TODO algorithms-panel</h2>
        <div style={{ marginLeft: 8 }}>
          <p>对算法参数进行配置</p>
          <p>初级: 导入导出 yaml/json 文件来进行配置</p>
          <p>高级: 提供交互式 UI 来进行配置</p>
          <br />
          <p>运行离线算法 以及 订阅在线算法</p>
          <p>查看算法运行情况</p>
        </div>
      </div>
    )
  }
}
