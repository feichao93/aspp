import { Button, ButtonGroup, Checkbox, Classes, Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import moment from 'moment'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { DocStatState } from '../../reducers/docStatReducer'
import MainState from '../../types/MainState'
import Action from '../../utils/actions'
import { toggle } from '../../utils/common'

interface DocStatProps {
  main: MainState
  docStat: DocStatState
  dispatch: Dispatch
}

class DocStat extends React.Component<DocStatProps> {
  state = {
    checkedCollNames: Set<string>(),
  }

  toggle = (collName: string) => {
    this.setState({
      checkedCollNames: toggle(this.state.checkedCollNames, collName),
    })
  }

  reqDiff = () => {
    const { main, dispatch } = this.props
    const { checkedCollNames } = this.state
    dispatch(Action.requestDiffColls(main.docname, checkedCollNames.toArray()))
  }

  render() {
    const { main, docStat, dispatch } = this.props
    const { checkedCollNames } = this.state

    return (
      <div>
        <h2>{main.docname}</h2>
        <table className={Classes.HTML_TABLE}>
          <thead>
            <tr>
              <th />
              <th>标注集合名称</th>
              <th>最后编辑时间</th>
              <th>标注数量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {docStat.stat.map(s => (
              <tr key={s.collname}>
                <td>
                  <Checkbox
                    checked={checkedCollNames.has(s.collname)}
                    onClick={() => this.toggle(s.collname)}
                  />
                </td>
                <td>{s.collname}</td>
                <td>{moment(s.fileStat.mtimeMs).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>{s.annotationCount}</td>
                <td style={{ padding: 8 }}>
                  <ButtonGroup>
                    <Button
                      small
                      text="打开"
                      icon="document-open"
                      disabled
                      onClick={() => dispatch(Action.requestOpenColl(main.docname, s.collName))}
                    />
                    <Button
                      small
                      text="删除"
                      icon="trash"
                      intent={Intent.DANGER}
                      disabled
                      onClick={() => dispatch(Action.requestDeleteColl(main.docname, s.collName))}
                    />
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button text="文件对比" large onClick={this.reqDiff} />
      </div>
    )
  }
}

export default connect(({ main, docStat }: State) => ({ main, docStat }))(DocStat)
