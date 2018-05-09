import { List, Map } from 'immutable'
import React from 'react'

import TaskConfig from './types/TaskConfig'

namespace CONFIG {
  export const taskConfig: TaskConfig = require('./aspp.config.yaml')

  export const shortcutMap = Map(
    taskConfig.tags.filter(t => t.shortcut).map(t => [t.shortcut, t.name] as [string, string]),
  )

  function isDefaultGroup(tagConfig: TaskConfig.TagConfig) {
    return tagConfig.group == null || tagConfig.group === 'default'
  }

  export const defaultGroup = List(taskConfig.tags).filter(isDefaultGroup)
  export const otherGroups = List(taskConfig.tags)
    .filter(t => !isDefaultGroup(t))
    .groupBy(t => t.group)

  export const styleMap = Map(
    taskConfig.tags.map(t => [t.name, t.theme] as [string, React.CSSProperties]),
  )

  export const abbrMap = Map(taskConfig.tags.map(t => [t.name, t.abbr] as [string, string]))
}

export default CONFIG
