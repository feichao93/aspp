import { MulticastChannel } from 'little-saga/compat'
import React from 'react'
import { Interaction } from '../utils/InteractionCollector'

interface TaskConfigFormProps<Options = any> {
  impl: TaskConstructor
  name: string
  options: Options
  onChangeName(nextName: string): void
  onChangeOptions(nextOptions: Options): void
  onClose(): void
}

export default interface TaskConstructor {
  disabled?: boolean
  singleton?: boolean
  defaultTaskName: string
  defaultOptions?: any
  description: string
  Form?: React.ComponentClass<TaskConfigFormProps>
  new (...args: any[]): {
    saga(chan: MulticastChannel<Interaction>): IterableIterator<any>
  }
}
