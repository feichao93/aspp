import { List, OrderedMap, Record } from 'immutable'
import { Task as SagaTask } from 'little-saga'
import SentenceSegmentation from '../tasks/SentenceSegmentation'
import SimpleMatching from '../tasks/SimpleMatching'
import SimpleOffsetAdjusting from '../tasks/SimpleOffsetAdjusting'
import StanfordNLP from '../tasks/StanfordNLP'
import AutoAnnotate from './AutoAnnotate'
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
])

export const initTaskMap: TaskMap = taskImplList
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
