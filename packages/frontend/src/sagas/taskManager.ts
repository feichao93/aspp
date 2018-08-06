import { Intent } from '@blueprintjs/core'
import { delay, io, multicastChannel, takeEvery } from 'little-saga'
import { State } from '../reducers'
import { setTaskAsIdle, setTaskAsRunning, setTaskInst } from '../reducers/taskReducer'
import { findImplByName, Task } from '../tasks'
import Action from '../utils/actions'
import { a } from '../utils/common'
import { LS_TASK_OPTIONS } from '../utils/constants'
import InteractionCollector, { Interaction } from '../utils/InteractionCollector'

function* taskRunningManager() {
  const chan = multicastChannel<Interaction>()

  yield io.fork(broadcastInteractions)
  yield takeEvery(a('RUN_TASK'), handleRunTask)
  yield takeEvery(a('STOP_TASK'), handleStopTask)

  function* broadcastInteractions() {
    const collector: InteractionCollector = yield io.getContext('collector')
    while (true) {
      const interaction: Interaction = yield io.take(collector.channel, '*')
      yield delay(0)
      chan.put(interaction)
    }
  }

  function* handleRunTask({ id }: Action.RunTask) {
    try {
      const { taskMap }: State = yield io.select()
      const task = taskMap.get(id)
      const inst = new task.impl(task)
      const sagaTask = yield io.spawn([inst, inst.saga], chan)
      yield io.put(setTaskAsRunning(id, sagaTask))
      yield io.join(sagaTask)
    } catch (e) {
      console.error(e)
      yield io.put(
        Action.toast(
          `Task ${id} failed to run due to an error. See console for more info.`,
          Intent.DANGER,
        ),
      )
    } finally {
      yield io.put(setTaskAsIdle(id))
    }
  }

  function* handleStopTask({ id }: Action.StopTask) {
    const { taskMap }: State = yield io.select()
    const sagaTask = taskMap.get(id).sagaTask
    yield io.cancel(sagaTask)
  }
}

interface TaskLocalStorageItem {
  id: string
  name: string
  implName: string
  options: any
}

const taskStateLocalStorageManager = {
  get(): TaskLocalStorageItem[] {
    try {
      return JSON.parse(localStorage.getItem(LS_TASK_OPTIONS))
    } catch (e) {
      return []
    }
  },
  set(taskState: TaskLocalStorageItem[]) {
    localStorage.setItem(LS_TASK_OPTIONS, JSON.stringify(taskState))
  },
}

function* taskLSStateManager() {
  const initTaskState = taskStateLocalStorageManager.get()
  const { taskMap: oldTaskMap }: State = yield io.select()
  for (const item of initTaskState) {
    if (!oldTaskMap.has(item.id)) {
      yield io.put(
        setTaskInst(
          item.id,
          new Task({
            id: item.id,
            name: item.name,
            impl: findImplByName(item.implName),
            options: item.options,
          }),
        ),
      )
    }
  }

  while (true) {
    yield io.take([a('UPDATE_TASK_MAP'), a('ADD_TASK'), a('DELETE_TASK')])
    const { taskMap }: State = yield io.select()
    const taskState = taskMap
      .map(t => ({
        id: t.id,
        name: t.name,
        implName: t.impl.name,
        options: t.options,
      }))
      .toList()
      .toJS()
    taskStateLocalStorageManager.set(taskState)
  }
}

export default function* taskManager() {
  yield io.fork(taskRunningManager)
  yield io.fork(taskLSStateManager)
}
