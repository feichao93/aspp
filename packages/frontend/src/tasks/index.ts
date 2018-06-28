import { List, OrderedMap, Record } from 'immutable'
import { Task as SagaTask } from 'little-saga'
import SentenceSegmentation from '../tasks/SentenceSegmentation'
import SimpleMatching from '../tasks/SimpleMatching'
import SimpleOffsetAdjusting from '../tasks/SimpleOffsetAdjusting'
import StanfordNLP from '../tasks/StanfordNLP'
import AutoAnnotate from './AutoAnnotate'
import SimpleMerge from './SimpleMerge'
import TaskConstructor from './TaskConstructor'

export class Task extends Record({
  impl: null as TaskConstructor,
  id: '',
  name: null as string,
  options: null as any,
  status: 'idle' as TaskStatus,
  sagaTask: null as SagaTask,
}) {}

type TaskStatus = 'idle' | 'running'

export type TaskMap = OrderedMap<string, Task>

export const taskImplList = List<TaskConstructor>([
  SimpleMatching,
  SimpleOffsetAdjusting,
  SentenceSegmentation,
  StanfordNLP,
  AutoAnnotate,
  SimpleMerge,
])

if (DEV_ASSERT) {
  taskImplList.forEach(impl => {
    console.assert(impl.defaultTaskName != null, 'Task constructor must have a defaultTaskName')

    console.assert(impl.description != null, 'Task constructor must have a description')

    if (impl.defaultOptions != null) {
      console.assert(
        impl.Form != null,
        'Task constructor must provide a Form implementation when it has defaultOptions',
      )
    }

    if (impl.Form != null) {
      console.assert(
        impl.defaultOptions != null,
        'Task constructor must provide defaultOptions when if it has a Form implementation',
      )
    }
  })
}

export const initTaskMap: TaskMap = taskImplList
  .filter(impl => {
    if (DEV_HELPER) {
      return true
    }
    return impl.singleton
  })
  .map(
    impl =>
      new Task({
        impl,
        id: impl.defaultTaskName,
        name: impl.defaultTaskName,
        options: impl.defaultOptions,
      }),
  )
  .toOrderedMap()
  .mapKeys((_, task) => task.id)
