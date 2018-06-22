import {
  AnchorButton,
  ButtonGroup,
  Dialog,
  Icon,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Position,
  Tooltip,
} from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { setTaskName, setTaskOptions } from '../../reducers/taskReducer'
import { Task, taskImplList, TaskMap } from '../../tasks'
import Action from '../../utils/actions'
import './TaskPanel.styl'

function AddTaskMenu({ dispatch }: { dispatch: Dispatch }) {
  return (
    <Popover
      content={
        <Menu>
          {taskImplList
            .filterNot(impl => impl.singleton)
            .map(impl => (
              <MenuItem
                key={impl.defaultTaskName}
                text={impl.defaultTaskName}
                onClick={() => dispatch(Action.addTask(impl, impl.defaultOptions))}
              />
            ))}
        </Menu>
      }
      target={<AnchorButton text="Add Task" rightIcon="caret-down" />}
      position={Position.BOTTOM_LEFT}
      minimal
      transitionDuration={0}
    />
  )
}

interface TaskPanelProps {
  taskMap: TaskMap
  dispatch: Dispatch
}

class TaskPanel extends React.Component<TaskPanelProps> {
  state = {
    dialogContent: null as any,
  }

  restartTask = (id: string) => {
    const { dispatch } = this.props
    dispatch(Action.stopTask(id))
    dispatch(Action.runTask(id))
  }

  duplicateTask = (id: string) => {
    const { taskMap, dispatch } = this.props
    const task = taskMap.get(id)
    dispatch(Action.addTask(task.impl, task.options))
  }

  deleteTask = (id: string) => {
    const { dispatch, taskMap } = this.props
    const task = taskMap.get(id)
    if (task.sagaTask) {
      dispatch(Action.stopTask(id))
    }
    dispatch(Action.deleteTask(id))
  }

  closeConfigDialog = () => {
    this.setState({ dialogContent: null })
  }

  openConfigDialog = (task: Task) => {
    const { dispatch } = this.props
    const dialogContent = React.createElement(task.impl.Form, {
      impl: task.impl,
      name: task.name,
      options: task.options,
      onChangeName: (name: string) => dispatch(setTaskName(task.id, name)),
      onChangeOptions: (options: string) => dispatch(setTaskOptions(task.id, options)),
      onClose: this.closeConfigDialog,
    })
    this.setState({ dialogContent })
  }

  render() {
    const { dispatch, taskMap } = this.props
    const { dialogContent } = this.state

    return (
      <div className="panel task-panel">
        <Dialog isOpen={Boolean(dialogContent)}>{this.state.dialogContent}</Dialog>
        <AddTaskMenu dispatch={dispatch} />

        {taskMap
          .map((task, instId) => (
            <div key={instId} className="task-row">
              <header>
                <Tooltip
                  content={<div style={{ width: 350 }}>{task.impl.description}</div>}
                  modifiers={{
                    preventOverflow: { enabled: false },
                    hide: { enabled: false },
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon
                      icon="info-sign"
                      title={null}
                      intent={
                        task.impl.disabled
                          ? Intent.DANGER
                          : task.status === 'running'
                            ? Intent.SUCCESS
                            : Intent.NONE
                      }
                    />
                    <h2 className="task-name">{task.name}</h2>
                  </div>
                </Tooltip>
              </header>
              <main>
                <ButtonGroup style={{ width: 120 }}>
                  {task.status === 'idle' ? (
                    <AnchorButton
                      icon="play"
                      disabled={task.impl.disabled}
                      onClick={() => dispatch(Action.runTask(task.id))}
                    />
                  ) : (
                    <AnchorButton icon="redo" onClick={() => this.restartTask(task.id)} />
                  )}
                  <AnchorButton
                    icon="symbol-square"
                    disabled={task.status === 'idle'}
                    onClick={() => dispatch(Action.stopTask(task.id))}
                  />
                  <AnchorButton
                    icon="cog"
                    disabled={task.options == null}
                    onClick={() => this.openConfigDialog(task)}
                  />
                </ButtonGroup>
                {!task.impl.singleton && (
                  <ButtonGroup>
                    <AnchorButton icon="duplicate" onClick={() => this.duplicateTask(task.id)} />
                    <AnchorButton
                      intent={Intent.DANGER}
                      icon="delete"
                      onClick={() => this.deleteTask(task.id)}
                    />
                  </ButtonGroup>
                )}
              </main>
            </div>
          ))
          .valueSeq()}
      </div>
    )
  }
}

export default connect((s: State) => ({ taskMap: s.taskMap }))(TaskPanel)
