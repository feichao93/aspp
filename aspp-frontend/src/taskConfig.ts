import React from 'react'
import TaskConfig from './types/TaskConfig'

const taskConfig: TaskConfig = require('./aspp.config.yaml')

export const shortcutMap = new Map(
  taskConfig.tags.filter(t => t.shortcut).map(t => [t.shortcut, t.name] as [string, string]),
)

export const primaryTagConfigs = taskConfig.tags.filter(
  tagConfig => tagConfig.category === 'primary',
)

export const secondaryTagConfigs = taskConfig.tags.filter(
  tagConfig => tagConfig.category === 'secondary',
)

export const styleMap = new Map(
  taskConfig.tags.map(t => [t.name, t.theme] as [string, React.CSSProperties]),
)

export const abbrMap = new Map(taskConfig.tags.map(t => [t.name, t.abbr] as [string, string]))

export default taskConfig
