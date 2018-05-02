import React from 'react'
import './TagsPanel.styl'

export default class TagsPanel extends React.Component {
  render() {
    return (
      <div className="panel tags-panel">
        <h2>TODO tags-panel</h2>
        <div style={{ marginLeft: 8 }}>
          <p>对标签组进行配置</p>
          <p>初级: 导入导出 yaml/json 文件来进行配置</p>
          <p>高级: 提供交互式 UI 来进行配置</p>
          <br />
          <p>使用标签进行标注</p>
        </div>
      </div>
    )
  }
}
