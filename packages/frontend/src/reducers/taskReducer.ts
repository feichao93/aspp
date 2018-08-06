import { Task as SagaTask } from 'little-saga'
import { initTaskMap, Task, TaskMap } from '../tasks'
import Action from '../utils/actions'

function getProperTaskId(taskMap: TaskMap, prefix: string) {
  const idSet = taskMap.keySeq().toSet()
  let i = 1
  while (true) {
    const taskId = `${prefix}-${i}`
    if (!idSet.has(taskId)) {
      return taskId
    }
    i++
  }
}

export default function taskReducer(state = initTaskMap, action: Action) {
  if (action.type === 'UPDATE_TASK_MAP') {
    return action.updater(state)
  } else if (action.type === 'ADD_TASK') {
    const id = getProperTaskId(state, action.impl.defaultTaskName)
    const task = new Task({ impl: action.impl, options: action.options, id, name: id })
    return state.set(id, task)
  } else if (action.type === 'DELETE_TASK') {
    return state.delete(action.id)
  }
  return state
}

function updateTaskMap(updater: (m: TaskMap) => TaskMap): Action.UpdateTaskMap {
  return { type: 'UPDATE_TASK_MAP', updater }
}

function updateTaskInst(taskId: string, updater: (s: Task) => Task) {
  return updateTaskMap(map => map.update(taskId, updater))
}

export function setTaskInst(taskId: string, task: Task) {
  return updateTaskInst(taskId, () => task)
}

export function setTaskName(id: string, nextName: string) {
  return updateTaskInst(id, d => d.set('name', nextName))
}

export function setTaskOptions(id: string, options: any) {
  return updateTaskInst(id, d => d.set('options', options))
}

export function setTaskAsRunning(id: string, sagaTask: SagaTask) {
  return updateTaskInst(id, d => d.set('status', 'running').set('sagaTask', sagaTask))
}

export function setTaskAsIdle(id: string) {
  return updateTaskInst(id, d => d.set('status', 'idle').set('sagaTask', null))
}
