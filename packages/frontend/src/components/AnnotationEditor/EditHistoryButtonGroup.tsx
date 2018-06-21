import { Button, ButtonGroup, Tooltip } from '@blueprintjs/core'
import { is } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { CacheState } from '../../reducers/cacheReducer'
import MainHistory from '../../types/MainHistory'
import MainState from '../../types/MainState'
import {
  requestCloseCurrentColl,
  requestSaveCurrentColl,
  userRequestRedo,
  userRequestRevert,
  userRequestUndo,
} from '../../utils/actionCreators'

export interface EditHistoryGroupProps {
  main: MainState
  history: MainHistory
  cache: CacheState
  dispatch: Dispatch
}

class EditHistoryButtonGroup extends React.Component<EditHistoryGroupProps> {
  render() {
    const { main, cache, dispatch, history } = this.props

    return (
      <ButtonGroup>
        <Tooltip content="保存标注文件到服务器">
          <Button
            style={{ marginLeft: 16 }}
            icon="cloud-upload"
            disabled={is(cache.annotations, main.annotations)}
            onClick={() => dispatch(requestSaveCurrentColl())}
          />
        </Tooltip>
        <Tooltip content="关闭当前文件">
          <Button
            disabled={main.getStatus() === 'closed'}
            icon="cross"
            onClick={() => dispatch(requestCloseCurrentColl())}
          />
        </Tooltip>
        <Tooltip content="回滚操作记录到上一次保存文件前的状态">
          <Button
            icon="double-chevron-up"
            disabled={history.count === 0}
            onClick={() => dispatch(userRequestRevert())}
          />
        </Tooltip>
        <Tooltip content="撤销">
          <Button
            icon="undo"
            disabled={history.count === 0}
            onClick={() => dispatch(userRequestUndo())}
          />
        </Tooltip>
        <Tooltip content="重做">
          <Button
            icon="redo"
            disabled={history.count >= history.list.size}
            onClick={() => dispatch(userRequestRedo())}
          />
        </Tooltip>
      </ButtonGroup>
    )
  }
}

export default connect((s: State) => ({ main: s.main, history: s.history, cache: s.cache }))(
  EditHistoryButtonGroup,
)
