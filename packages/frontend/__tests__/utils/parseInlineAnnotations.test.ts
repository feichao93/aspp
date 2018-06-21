import { RawAnnotation } from '../../src/types/Annotation'
import { parseInlineAnnotations as parse } from '../../src/utils/parseInlineAnnotations'

test('解析 inline-annotation 格式 - 基本情况', () => {
  const actual = parse(
    '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]',
  )

  const t = '2017年第四季度净收入为146.08亿元，同比增加20.7%；净利润为12.86亿元'
  expect(actual.block).toBe(t)

  const annotations = actual.annotations
  expect(annotations.length).toBe(4)

  const [a, b, c, d] = annotations
  const blockIndex = 0
  let startOffset
  let endOffset
  let entity

  entity = '2017年'
  startOffset = t.indexOf(entity)
  endOffset = startOffset + entity.length
  expect(a.entity).toBe(entity)
  expect(a.range).toEqual({ blockIndex, startOffset, endOffset })
  expect(a.tag).toBe('DATE')

  entity = '146.08亿元'
  startOffset = t.indexOf(entity)
  endOffset = startOffset + entity.length
  expect(b.entity).toBe(entity)
  expect(b.range).toEqual({ blockIndex, startOffset, endOffset })
  expect(b.tag).toBe('$')

  entity = '增加20.7%'
  startOffset = t.indexOf(entity)
  endOffset = startOffset + entity.length
  expect(c.entity).toBe(entity)
  expect(c.range).toEqual({ blockIndex, startOffset, endOffset })
  expect(c.tag).toBe('P')

  entity = '12.86亿元'
  startOffset = t.indexOf(entity)
  endOffset = startOffset + entity.length
  expect(d.entity).toBe(entity)
  expect(d.range).toEqual({ blockIndex, startOffset, endOffset })
  expect(d.tag).toBe('$')
})

test('解析 inline-annotation 格式 - 处理转义的情况 - 1', () => {
  expect(parse('\\[DATE/2017年]第四季度')).toEqual({
    block: '[DATE/2017年]第四季度',
    annotations: [] as RawAnnotation[],
  })
})

test('解析 inline-annotation 格式 - 处理转义的情况 - 2', () => {
  expect(parse('\\\\[DATE/2017年]第四季度')).toEqual({
    block: '\\2017年第四季度',
    annotations: [
      {
        type: 'annotation',
        id: 'annotation-0',
        entity: '2017年',
        tag: 'DATE',
        range: { blockIndex: 0, startOffset: 1, endOffset: 6 },
      },
    ],
  })
})

test('解析 inline-annotation 格式 - 处理转义的情况 - 3', () => {
  expect(parse('[DATE/2017年\\]第四季度]')).toEqual({
    block: '2017年]第四季度',
    annotations: [
      {
        type: 'annotation',
        id: 'annotation-0',
        entity: '2017年]第四季度',
        tag: 'DATE',
        range: { blockIndex: 0, startOffset: 0, endOffset: 10 },
      },
    ] as RawAnnotation[],
  })
})

test('解析 inline-annotation 格式 - 处理转义的情况 - 4', () => {
  expect(parse('[DATE/2017年\\\\]第四季度]')).toEqual({
    block: '2017年\\第四季度]',
    annotations: [
      {
        type: 'annotation',
        id: 'annotation-0',
        entity: '2017年\\',
        tag: 'DATE',
        range: { blockIndex: 0, startOffset: 0, endOffset: 6 },
      },
    ] as RawAnnotation[],
  })
})

test('解析圆括号', () => {
  expect(parse('(DATE/2017年)第四季度')).toEqual({
    block: '2017年第四季度',
    annotations: [],
  })
})
