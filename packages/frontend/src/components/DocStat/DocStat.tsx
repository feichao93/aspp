import { Button, ButtonGroup, Checkbox, Classes, Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import moment from 'moment'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { DocStatState } from '../../reducers/docStatReducer'
import FileInfo from '../../types/FileInfo'
import Action from '../../utils/actions'
import { toggle } from '../../utils/common'

interface DocStatProps {
  fileInfo: FileInfo
  docStat: DocStatState
  dispatch: Dispatch
}

class DocStat extends React.Component<DocStatProps> {
  state = {
    checkedCollnames: Set<string>(),
  }

  toggle = (collname: string) => {
    this.setState({
      checkedCollnames: toggle(this.state.checkedCollnames, collname),
    })
  }

  reqDiff = () => {
    const { dispatch, fileInfo, docStat } = this.props
    const { checkedCollnames } = this.state
    const collnames = docStat.items
      .map(item => item.collname)
      .filter(name => checkedCollnames.has(name))
      .toArray()
    dispatch(Action.reqDiffColls(fileInfo.set('collname', ''), collnames))
  }

  render() {
    const { fileInfo, docStat, dispatch } = this.props
    const { checkedCollnames } = this.state

    return (
      <div>
        <h2>{fileInfo.docname}</h2>
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
            {docStat.items.map(item => (
              <tr key={item.collname}>
                <td>
                  <Checkbox
                    checked={checkedCollnames.has(item.collname)}
                    onClick={() => this.toggle(item.collname)}
                  />
                </td>
                <td>{item.collname}</td>
                <td>{moment(item.fileStat.mtimeMs).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>{item.annotationCount}</td>
                <td style={{ padding: 8 }}>
                  <ButtonGroup>
                    <Button
                      small
                      text="打开"
                      icon="document-open"
                      onClick={() =>
                        dispatch(Action.reqOpenColl(fileInfo.set('collname', item.collname)))
                      }
                    />
                    <Button
                      small
                      text="删除"
                      icon="trash"
                      intent={Intent.DANGER}
                      onClick={() =>
                        dispatch(Action.reqDeleteColl(fileInfo.set('collname', item.collname)))
                      }
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

const mapStateToProps = ({ fileInfo, docStat }: State) => ({ fileInfo, docStat })

export default connect(mapStateToProps)(DocStat)
