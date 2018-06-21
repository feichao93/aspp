import { List, Map, OrderedMap } from 'immutable'
import React from 'react'
import AsppConfig from './types/AsppConfig'
import { DEFAULT_GROUP_NAME } from './utils/constants'

namespace ASPP_CONFIG {
  export const asppConfig: AsppConfig = (window as any).ASPP_CONFIG

  export const shortcutMap = Map(
    asppConfig.tags.filter(t => t.shortcut).map(t => [t.shortcut, t.name] as [string, string]),
  )

  export function isDefaultGroup(tagConfig: AsppConfig.TagConfig) {
    return tagConfig.group == null || tagConfig.group === DEFAULT_GROUP_NAME
  }

  export const defaultGroup = List(asppConfig.tags).filter(isDefaultGroup)
  export const otherGroups = List(asppConfig.tags)
    .filter(t => !isDefaultGroup(t))
    .groupBy(t => t.group)
    .toOrderedMap() as OrderedMap<string, List<AsppConfig.TagConfig>>

  export const groups = OrderedMap({ [DEFAULT_GROUP_NAME]: defaultGroup }).merge(otherGroups)

  export const styleMap = Map(
    asppConfig.tags.map(t => [t.name, t.theme] as [string, React.CSSProperties]),
  )

  export const abbrMap = Map(asppConfig.tags.map(t => [t.name, t.abbr] as [string, string]))
}

export default ASPP_CONFIG
