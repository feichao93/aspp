import React from 'react'
import Annotation from '../../types/Annotation'
import DecorationRange from '../../types/DecorationRange'
import { getNextId } from '../../utils/common'
import './AnnotationDetailPanel.styl'

// TODO make it live!
const testAnnotation = new Annotation({
  id: getNextId('annotation'),
  confidence: 0.8,
  range: new DecorationRange({
    blockIndex: 0,
    startOffset: 10,
    endOffset: 20,
  }),
  tag: 'role',
})

interface AnnotationDetailPanelProps {
  annotation?: Annotation
}

const Literal = {
  String(str: string) {
    return <span className="string">{JSON.stringify(str)}</span>
  },
  Number(num: number) {
    return <span className="number">{num}</span>
  },
}

export default class AnnotationDetailPanel extends React.Component<AnnotationDetailPanelProps> {
  render() {
    return (
      <div className="panel annotation-detail-panel">
        <h2>TODO 当前高亮/选中的标注对象:</h2>
        <div className="code">
          <p>text: {Literal.String('灭霸（测试数据）')}</p>
          <p>tag: {Literal.String(testAnnotation.tag)}</p>
          <p>range: &#123;</p>
          <p>
            {'  '}blockIndex: {Literal.Number(testAnnotation.range.blockIndex)}
          </p>
          <p>
            {'  '}startOffset: {Literal.Number(testAnnotation.range.startOffset)}
          </p>
          <p>
            {'  '}endOffset: {Literal.Number(testAnnotation.range.endOffset)}
          </p>
          <p>&#125;</p>
          <p>
            confidence:&nbsp;{/* todo 使用 slider 或许会更好 */}
            <span className="number">{testAnnotation.confidence}</span>
            <button className="no-user-select accept-button">accept</button>
            <button className="no-user-select deny-button">deny</button>
            <button className="no-user-select edit-button">edit</button>
          </p>
          <p>
            author: <span className="string">{JSON.stringify('feichao')}</span>
          </p>
        </div>
        <div className="button-group" style={{ marginLeft: 8, marginTop: 12 }}>
          TODO 这里放置了一些对目前选中的标注对象的操作按钮
          <div>
            <button>移除这些标注</button>
          </div>
        </div>
      </div>
    )
  }
}
