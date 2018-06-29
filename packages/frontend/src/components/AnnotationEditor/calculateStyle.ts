import React from 'react'
import ASPP_CONFIG from '../../aspp-config'
import Decoration from '../../types/Decoration'
import { Diff } from '../../utils/calculateDiffs'

interface StyleApplyContext {
  decoration: Decoration
  visible: boolean
  selected: boolean
  height: number
}

type StyleApplyFn = (ctx: StyleApplyContext, style: React.CSSProperties) => void

const DIFF_SLOT_COLOR_MAP = {
  consistent: '#94e894',
  partial: '#ffe31b',
  conflict: '#ff0018',
}

const STYLES_APPLY_FN_ARRAY: StyleApplyFn[] = [
  function hint({ decoration, selected }, style) {
    if (Decoration.isHint(decoration)) {
      style.borderBottom = '1px dotted #192126'
      if (selected) {
        style.background = '#fce23c'
      }
    }
  },

  function diffSlot({ decoration, selected }, style) {
    if (Decoration.isSlot(decoration) && decoration.slotType === 'diff') {
      const diff: Diff = decoration.data
      style.background = DIFF_SLOT_COLOR_MAP[diff.type]
      if (selected) {
        style.outline = '3px solid steelblue'
      }
    }
  },

  function matchAndSentence({ decoration, selected }, style) {
    if (
      Decoration.isSlot(decoration) &&
      (decoration.slotType === 'match' || decoration.slotType === 'sentence')
    ) {
      style.boxShadow = 'rgba(158, 158, 158, 0.33) 1px 1px 3px 1.5px'
      style.outline = '1px solid #ccc'
      style.background = '#fff9c5'
      if (selected) {
        style.background = '#FFEB3B'
      }
    }
  },

  function annotation({ decoration, visible, selected, height }, style) {
    if (Decoration.isAnnotation(decoration) && visible) {
      if (!selected || height >= 2) {
        // 未选中的标注或是高度大于等于2的标注：应用 ASPP 配置文件中的样式
        Object.assign(style, ASPP_CONFIG.styleMap.get(decoration.tag))
      }

      if (selected) {
        if (height === 0) {
          style.background = '#ffe500'
          style.boxShadow = '#616161 1px 1px 10px 0.5px'
        } else if (height === 1) {
          style.background = '#fff9c5'
          style.boxShadow = 'rgba(128, 128, 128, 0.3) 0px 0px 10px 3px'
        } else {
          style.outline = '1px dashed #666'
          style.outlineOffset = `${height * 2}px`
        }
      }
    }
  },
]

export default function calculateStyle(ctx: StyleApplyContext) {
  const style: React.CSSProperties = {}
  STYLES_APPLY_FN_ARRAY.forEach(fn => fn(ctx, style))
  return style
}
